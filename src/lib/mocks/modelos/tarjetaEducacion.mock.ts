import { Module } from '#lib/config/permissions.config.ts';
import type { TarjetaEducacion } from '#lib/interfaces/index.ts';
import { tarjetaEducacionSchema } from '#lib/zod/tarjetaFormacion.schema.ts';
import { sinEliminado } from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { db, type EducacionRow } from '../db/tablas';

/** Modelo `tarjeta_educacion` */

export const educacionMock = crudHijo({
	tabla: db.educacion,
	padre: 'tarjeta_id',
	schema: tarjetaEducacionSchema,
	nombre: 'El estudio',
	construir: (datos) => ({
		institucion: datos.institucion,
		titulo: datos.titulo,
		area_estudio: datos.area_estudio,
		descripcion: datos.descripcion,
		fecha_inicio: datos.fecha_inicio,
		fecha_fin: datos.is_actual ? null : datos.fecha_fin,
		is_actual: !!datos.is_actual,
		is_visible: datos.is_visible ?? true
	})
});

export const aRespuestaEducacion = (fila: EducacionRow): TarjetaEducacion => sinEliminado(fila);

export const educacionRutas = rutasHijo({
	coleccion: '/tarjetas/:id/educacion',
	elemento: '/educacion/:rid',
	module: Module.EDUCACION,
	crud: educacionMock,
	aRespuesta: aRespuestaEducacion,
	tarjetaDelPadre: (tarjetaId) => tarjetaId,
	padreDeFila: (fila) => fila.tarjeta_id
});
