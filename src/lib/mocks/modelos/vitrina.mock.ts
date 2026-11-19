import { Module } from '#lib/config/permissions.config.ts';
import { MONEDA_POR_DEFECTO } from '#lib/constants/data.ts';
import type { Vitrina, VitrinaCompleta } from '#lib/interfaces/index.ts';
import { vitrinaNuevaSchema, vitrinaSchema } from '#lib/zod/vitrina.schema.ts';
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
import { db, type VitrinaRow } from '../db/tablas';
import { aRespuestaCategoria, categoriaMock } from './vitrinaCategoria.mock';
import { aRespuestaItem, itemMock } from './vitrinaItem.mock';

/** Modelo `vitrina`: una por tarjeta; nace con la tarjeta junto con sus categorías e ítems */

function deTarjeta(tarjetaId: string): VitrinaRow {
	const vitrina = db.vitrinas.activas().find((v) => v.tarjeta_id === tarjetaId);
	if (!vitrina) throw error.noEncontrado('La vitrina no existe.');
	return vitrina;
}

/** Crea la vitrina de una tarjeta nueva; las categorías se enlazan con los ítems por nombre */
function crearParaTarjeta(tarjetaId: string, cuerpo: unknown = {}): VitrinaRow {
	const datos = validar(vitrinaNuevaSchema, cuerpo);
	const marca = ahora();
	const vitrina = db.vitrinas.insertar({
		id: nuevoId(),
		tarjeta_id: tarjetaId,
		mostrar_precios: datos.mostrar_precios ?? true,
		moneda: datos.moneda ?? MONEDA_POR_DEFECTO,
		campo1_nombre: datos.campo1_nombre,
		campo2_nombre: datos.campo2_nombre,
		campo3_nombre: datos.campo3_nombre,
		campo4_nombre: datos.campo4_nombre,
		created_at: marca,
		updated_at: marca,
		is_deleted: false
	});

	const categorias = new Map<string, string>();
	for (const categoria of datos.categorias ?? []) {
		const fila = categoriaMock.crear(vitrina.id, categoria);
		categorias.set(fila.nombre.toLowerCase(), fila.id);
	}
	for (const { categoria_nombre, ...item } of datos.items ?? []) {
		const categoriaId = categoria_nombre
			? (categorias.get(categoria_nombre.toLowerCase()) ?? null)
			: null;
		itemMock.crear(vitrina.id, { ...item, categoria_id: categoriaId });
	}
	return vitrina;
}

function actualizar(tarjetaId: string, cuerpo: unknown): VitrinaRow {
	const actual = deTarjeta(tarjetaId);
	const cambios = typeof cuerpo === 'object' && cuerpo !== null ? cuerpo : {};
	const datos = validar(vitrinaSchema, { ...actual, ...cambios });
	return db.vitrinas.actualizar(actual.id, {
		mostrar_precios: datos.mostrar_precios ?? actual.mostrar_precios,
		moneda: datos.moneda ?? actual.moneda,
		campo1_nombre: datos.campo1_nombre,
		campo2_nombre: datos.campo2_nombre,
		campo3_nombre: datos.campo3_nombre,
		campo4_nombre: datos.campo4_nombre,
		updated_at: ahora()
	});
}

function completa(tarjetaId: string): VitrinaCompleta {
	const vitrina = deTarjeta(tarjetaId);
	return {
		...aRespuestaVitrina(vitrina),
		categorias: categoriaMock.listar(vitrina.id).map(aRespuestaCategoria),
		items: itemMock.listar(vitrina.id).map(aRespuestaItem)
	};
}

function eliminarDeTarjeta(tarjetaId: string): void {
	for (const vitrina of db.vitrinas.donde((v) => v.tarjeta_id === tarjetaId)) {
		itemMock.eliminarDelPadre(vitrina.id);
		categoriaMock.eliminarDelPadre(vitrina.id);
		db.vitrinas.eliminar(vitrina.id);
	}
}

export const vitrinaMock = { deTarjeta, crearParaTarjeta, actualizar, completa, eliminarDeTarjeta };

export const aRespuestaVitrina = (fila: VitrinaRow): Vitrina => sinEliminado(fila);

export const vitrinaRutas: RutaMock[] = [
	{
		metodo: 'GET',
		patron: '/tarjetas/:id/vitrina',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.VITRINA, Action.READ);
			exigirAccesoTarjeta(sesion, ctx.params.id);
			return completa(ctx.params.id);
		}
	},
	{
		metodo: 'PUT',
		patron: '/tarjetas/:id/vitrina',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.VITRINA, Action.UPDATE);
			exigirAccesoTarjeta(sesion, ctx.params.id);
			const fila = enTransaccion(() => actualizar(ctx.params.id, ctx.cuerpo));
			tocarTarjeta(ctx.params.id);
			return aRespuestaVitrina(fila);
		}
	}
];
