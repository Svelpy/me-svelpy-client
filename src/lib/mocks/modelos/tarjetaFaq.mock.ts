import { Module } from '#lib/config/permissions.config.ts';
import type { TarjetaFaq } from '#lib/interfaces/index.ts';
import { tarjetaFaqSchema } from '#lib/zod/tarjetaFormacion.schema.ts';
import { sinEliminado } from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { db, type FaqRow } from '../db/tablas';

/** Modelo `tarjeta_faq` */

export const faqMock = crudHijo({
	tabla: db.faq,
	padre: 'tarjeta_id',
	schema: tarjetaFaqSchema,
	nombre: 'La pregunta',
	construir: (datos) => ({
		pregunta: datos.pregunta,
		respuesta: datos.respuesta,
		is_visible: datos.is_visible ?? true
	})
});

export const aRespuestaFaq = (fila: FaqRow): TarjetaFaq => sinEliminado(fila);

export const faqRutas = rutasHijo({
	coleccion: '/tarjetas/:id/faq',
	elemento: '/faq/:rid',
	module: Module.FAQ,
	crud: faqMock,
	aRespuesta: aRespuestaFaq,
	tarjetaDelPadre: (tarjetaId) => tarjetaId,
	padreDeFila: (fila) => fila.tarjeta_id
});
