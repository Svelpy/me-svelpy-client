import { Module } from '#lib/config/permissions.config.ts';
import type { TarjetaSeo } from '#lib/interfaces/index.ts';
import { tarjetaSeoSchema } from '#lib/zod/tarjetaTheme.schema.ts';
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
import { db, type SeoRow } from '../db/tablas';

/** Modelo `tarjeta_seo`: uno por tarjeta. Lo que queda en null lo genera la tarjeta pública */

function deTarjeta(tarjetaId: string): SeoRow {
	const seo = db.seos.activas().find((s) => s.tarjeta_id === tarjetaId);
	if (!seo) throw error.noEncontrado('El SEO de la tarjeta no existe.');
	return seo;
}

function crearParaTarjeta(tarjetaId: string, parcial: unknown = {}): SeoRow {
	const entrada = typeof parcial === 'object' && parcial !== null ? parcial : {};
	const datos = validar(tarjetaSeoSchema, { robots_index: true, ...entrada });
	const marca = ahora();
	return db.seos.insertar({
		...datos,
		id: nuevoId(),
		tarjeta_id: tarjetaId,
		created_at: marca,
		updated_at: marca,
		is_deleted: false
	});
}

/** PUT: el SEO completo */
function actualizar(tarjetaId: string, cuerpo: unknown): SeoRow {
	const actual = deTarjeta(tarjetaId);
	const datos = validar(tarjetaSeoSchema, cuerpo);
	return db.seos.actualizar(actual.id, { ...datos, updated_at: ahora() });
}

function eliminarDeTarjeta(tarjetaId: string): void {
	for (const seo of db.seos.donde((s) => s.tarjeta_id === tarjetaId)) db.seos.eliminar(seo.id);
}

export const seoMock = { deTarjeta, crearParaTarjeta, actualizar, eliminarDeTarjeta };

export const aRespuestaSeo = (fila: SeoRow): TarjetaSeo => sinEliminado(fila);

export const seoRutas: RutaMock[] = [
	{
		metodo: 'GET',
		patron: '/tarjetas/:id/seo',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.SEO, Action.READ);
			exigirAccesoTarjeta(sesion, ctx.params.id);
			return aRespuestaSeo(deTarjeta(ctx.params.id));
		}
	},
	{
		metodo: 'PUT',
		patron: '/tarjetas/:id/seo',
		manejar: (ctx) => {
			const sesion = exigirSesion(ctx);
			exigirPermiso(sesion, Module.SEO, Action.UPDATE);
			exigirAccesoTarjeta(sesion, ctx.params.id);
			const fila = enTransaccion(() => actualizar(ctx.params.id, ctx.cuerpo));
			tocarTarjeta(ctx.params.id);
			return aRespuestaSeo(fila);
		}
	}
];
