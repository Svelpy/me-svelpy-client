import { Module } from '#lib/config/permissions.config.ts';
import { valoresDeRubro } from '#lib/config/rubros.config.ts';
import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
import type { TarjetaTheme, TarjetaThemeUpdateRequest } from '#lib/interfaces/index.ts';
import { tarjetaThemeSchema } from '#lib/zod/tarjetaTheme.schema.ts';
import {
	Action,
	ahora,
	error,
	exigirAccesoTarjeta,
	exigirPermiso,
	exigirSesion,
	nuevoId,
	sinEliminado,
	tocarTarjeta,
	validar,
	type RutaMock
} from '../db/contexto';
import { enTransaccion } from '../db/storage';
import { db, type TemaRow } from '../db/tablas';

/** Modelo `tarjeta_theme`: uno por tarjeta. Nace con el preset y la tipografía que sugiere el rubro */

function deTarjeta(tarjetaId: string): TemaRow {
	const tema = db.temas.activas().find((t) => t.tarjeta_id === tarjetaId);
	if (!tema) throw error.noEncontrado('El tema de la tarjeta no existe.');
	return tema;
}

function crearParaTarjeta(tarjetaId: string, rubro: string, parcial: unknown = {}): TemaRow {
	const sugerido = valoresDeRubro(rubro);
	const entrada = (
		typeof parcial === 'object' && parcial !== null ? parcial : {}
	) as Partial<TarjetaThemeUpdateRequest>;
	const preset = entrada.preset === undefined ? sugerido.preset : entrada.preset;
	const datos = validar(tarjetaThemeSchema, {
		...TEMAS_TARJETA[preset ?? sugerido.preset].colores,
		tipografia: sugerido.tipografia,
		...entrada,
		preset
	});
	const marca = ahora();
	return db.temas.insertar({
		...datos,
		id: nuevoId(),
		tarjeta_id: tarjetaId,
		created_at: marca,
		updated_at: marca,
		is_deleted: false
	});
}

/** PUT: el tema completo */
function actualizar(tarjetaId: string, cuerpo: unknown): TemaRow {
	const actual = deTarjeta(tarjetaId);
	const datos = validar(tarjetaThemeSchema, cuerpo);
	return db.temas.actualizar(actual.id, { ...datos, updated_at: ahora() });
}

function eliminarDeTarjeta(tarjetaId: string): void {
	for (const tema of db.temas.donde((t) => t.tarjeta_id === tarjetaId)) db.temas.eliminar(tema.id);
}

export const temaMock = { deTarjeta, crearParaTarjeta, actualizar, eliminarDeTarjeta };

export const aRespuestaTema = (fila: TemaRow): TarjetaTheme => sinEliminado(fila);

export const temaRutas: RutaMock[] = [
	{
		metodo: 'GET',
		patron: '/tarjetas/:id/theme',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TEMA, Action.READ);
			exigirAccesoTarjeta(sesion, ctx.params.id);
			return aRespuestaTema(deTarjeta(ctx.params.id));
		}
	},
	{
		metodo: 'PUT',
		patron: '/tarjetas/:id/theme',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.TEMA, Action.UPDATE);
			exigirAccesoTarjeta(sesion, ctx.params.id);
			const fila = enTransaccion(() => actualizar(ctx.params.id, ctx.cuerpo));
			tocarTarjeta(ctx.params.id);
			return aRespuestaTema(fila);
		}
	}
];
