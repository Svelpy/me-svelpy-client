import { z } from 'zod';
import { Module } from '#lib/config/permissions.config.ts';
import { valoresDeRubro } from '#lib/config/rubros.config.ts';
import {
	SECCIONES_ORDEN_POR_DEFECTO,
	SECCIONES_TARJETA
} from '#lib/config/seccionesTarjeta.config.ts';
import type { TarjetaSeccion, TarjetaSeccionInput } from '#lib/interfaces/index.ts';
import { textoOpcional } from '#lib/zod/common.ts';
import {
	tarjetaSeccionInputSchema,
	tarjetaSeccionesUpdateSchema
} from '#lib/zod/tarjetaTheme.schema.ts';
import {
	Action,
	ahora,
	error,
	exigirAccesoTarjeta,
	exigirPermiso,
	exigirSesion,
	nuevoId,
	porOrden,
	sinEliminado,
	tocarTarjeta,
	validar,
	type RutaMock
} from '../db/contexto';
import { enTransaccion } from '../db/storage';
import { db, type SeccionRow } from '../db/tablas';

/** Modelo `tarjeta_seccion`: las 9 secciones de cada tarjeta, una por clave. Solo se editan */

function deTarjeta(tarjetaId: string): SeccionRow[] {
	return db.secciones.donde((s) => s.tarjeta_id === tarjetaId).sort(porOrden);
}

/** Crea las 9 secciones; la vitrina toma el título que sugiere el rubro ("Tratamientos"…) */
function crearParaTarjeta(tarjetaId: string, rubro: string, entradas: unknown = []): SeccionRow[] {
	const lista = validar(
		z.array(tarjetaSeccionInputSchema).max(9),
		entradas
	) as TarjetaSeccionInput[];
	const tituloVitrina = valoresDeRubro(rubro).tituloVitrina;
	const marca = ahora();
	SECCIONES_ORDEN_POR_DEFECTO.forEach((clave, indice) => {
		const entrada = lista.find((e) => e.clave === clave);
		const tituloSugerido =
			clave === 'vitrina' && tituloVitrina !== SECCIONES_TARJETA.vitrina.titulo
				? tituloVitrina
				: null;
		db.secciones.insertar({
			id: nuevoId(),
			tarjeta_id: tarjetaId,
			clave,
			titulo: entrada?.titulo ?? tituloSugerido,
			is_visible: entrada?.is_visible ?? true,
			orden: entrada?.orden ?? indice,
			created_at: marca,
			updated_at: marca,
			is_deleted: false
		});
	});
	return deTarjeta(tarjetaId);
}

/** PUT con las 9: orden, visibilidad y título de cada una */
function actualizarTodas(tarjetaId: string, cuerpo: unknown): SeccionRow[] {
	const { secciones } = validar(tarjetaSeccionesUpdateSchema, cuerpo);
	const marca = ahora();
	for (const entrada of secciones) {
		const fila = deTarjeta(tarjetaId).find((s) => s.clave === entrada.clave);
		if (!fila) throw error.noEncontrado(`La sección ${entrada.clave} no existe.`);
		db.secciones.actualizar(fila.id, {
			titulo: entrada.titulo,
			is_visible: entrada.is_visible,
			orden: entrada.orden,
			updated_at: marca
		});
	}
	return deTarjeta(tarjetaId);
}

const seccionPatchSchema = z.object({
	titulo: textoOpcional('El título de la sección', 80),
	is_visible: z.boolean(),
	orden: z.number().int().min(0)
});

function actualizar(id: string, cuerpo: unknown): SeccionRow {
	const actual = db.secciones.buscar(id);
	if (!actual) throw error.noEncontrado('La sección no existe.');
	const cambios = typeof cuerpo === 'object' && cuerpo !== null ? cuerpo : {};
	const datos = validar(seccionPatchSchema, { ...actual, ...cambios });
	return db.secciones.actualizar(id, { ...datos, updated_at: ahora() });
}

function eliminarDeTarjeta(tarjetaId: string): void {
	for (const seccion of deTarjeta(tarjetaId)) db.secciones.eliminar(seccion.id);
}

export const seccionMock = {
	deTarjeta,
	crearParaTarjeta,
	actualizarTodas,
	actualizar,
	eliminarDeTarjeta
};

export const aRespuestaSeccion = (fila: SeccionRow): TarjetaSeccion => sinEliminado(fila);

export const seccionRutas: RutaMock[] = [
	{
		metodo: 'GET',
		patron: '/tarjetas/:id/secciones',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.SECCION, Action.READ);
			exigirAccesoTarjeta(sesion, ctx.params.id);
			return deTarjeta(ctx.params.id).map(aRespuestaSeccion);
		}
	},
	{
		metodo: 'PUT',
		patron: '/tarjetas/:id/secciones',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.SECCION, Action.UPDATE);
			exigirAccesoTarjeta(sesion, ctx.params.id);
			const filas = enTransaccion(() => actualizarTodas(ctx.params.id, ctx.cuerpo));
			tocarTarjeta(ctx.params.id);
			return filas.map(aRespuestaSeccion);
		}
	},
	{
		metodo: 'PATCH',
		patron: '/secciones/:rid',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.SECCION, Action.UPDATE);
			const seccion = db.secciones.buscar(ctx.params.rid);
			if (!seccion) throw error.noEncontrado('La sección no existe.');
			exigirAccesoTarjeta(sesion, seccion.tarjeta_id);
			const fila = enTransaccion(() => actualizar(ctx.params.rid, ctx.cuerpo));
			tocarTarjeta(seccion.tarjeta_id);
			return aRespuestaSeccion(fila);
		}
	}
];
