import { Module } from '#lib/config/permissions.config.ts';
import type { TarjetaCertificacion } from '#lib/interfaces/index.ts';
import { tarjetaCertificacionSchema } from '#lib/zod/tarjetaFormacion.schema.ts';
import { sinEliminado } from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { db, type CertificacionRow } from '../db/tablas';

/** Modelo `tarjeta_certificacion` */

export const certificacionMock = crudHijo({
	tabla: db.certificaciones,
	padre: 'tarjeta_id',
	schema: tarjetaCertificacionSchema,
	nombre: 'La certificación',
	construir: (datos) => ({
		nombre: datos.nombre,
		entidad_emisora: datos.entidad_emisora,
		codigo_credencial: datos.codigo_credencial,
		url_credencial: datos.url_credencial,
		fecha_emision: datos.fecha_emision,
		fecha_expiracion: datos.no_expira ? null : datos.fecha_expiracion,
		no_expira: !!datos.no_expira,
		descripcion: datos.descripcion,
		is_visible: datos.is_visible ?? true
	})
});

export const aRespuestaCertificacion = (fila: CertificacionRow): TarjetaCertificacion =>
	sinEliminado(fila);

export const certificacionRutas = rutasHijo({
	coleccion: '/tarjetas/:id/certificaciones',
	elemento: '/certificaciones/:rid',
	module: Module.CERTIFICACION,
	crud: certificacionMock,
	aRespuesta: aRespuestaCertificacion,
	tarjetaDelPadre: (tarjetaId) => tarjetaId,
	padreDeFila: (fila) => fila.tarjeta_id
});
