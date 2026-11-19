import { Module } from '#lib/config/permissions.config.ts';
import type { TarjetaSocial } from '#lib/interfaces/index.ts';
import { tarjetaSocialSchema } from '#lib/zod/tarjetaSocial.schema.ts';
import { sinEliminado } from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { db, type SocialRow } from '../db/tablas';

/** Modelo `tarjeta_social` (rutas /tarjetas/:id/redes) */

export const socialMock = crudHijo({
	tabla: db.sociales,
	padre: 'tarjeta_id',
	schema: tarjetaSocialSchema,
	nombre: 'La red',
	construir: (datos) => ({
		red: datos.red,
		url: datos.url,
		username: datos.username,
		is_visible: datos.is_visible ?? true
	})
});

export const aRespuestaSocial = (fila: SocialRow): TarjetaSocial => sinEliminado(fila);

export const socialRutas = rutasHijo({
	coleccion: '/tarjetas/:id/redes',
	elemento: '/redes/:rid',
	module: Module.RED_SOCIAL,
	crud: socialMock,
	aRespuesta: aRespuestaSocial,
	tarjetaDelPadre: (tarjetaId) => tarjetaId,
	padreDeFila: (fila) => fila.tarjeta_id
});
