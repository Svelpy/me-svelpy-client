import { Module } from '#lib/config/permissions.config.ts';
import type { TarjetaContacto } from '#lib/interfaces/index.ts';
import { tarjetaContactoSchema } from '#lib/zod/tarjetaContacto.schema.ts';
import { sinEliminado } from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { db, type ContactoRow } from '../db/tablas';

/** Modelo `tarjeta_contacto`. Un solo principal por tipo; WhatsApp solo en teléfonos */

export const contactoMock = crudHijo({
	tabla: db.contactos,
	padre: 'tarjeta_id',
	schema: tarjetaContactoSchema,
	nombre: 'El contacto',
	construir: (datos) => ({
		tipo: datos.tipo,
		valor: datos.valor,
		etiqueta: datos.etiqueta,
		is_wpp: datos.tipo === 'phone' && !!datos.is_wpp,
		is_primary: !!datos.is_primary,
		is_visible: datos.is_visible ?? true
	}),
	despues: (fila) => {
		if (!fila.is_primary) return;
		const otros = db.contactos.donde(
			(c) =>
				c.tarjeta_id === fila.tarjeta_id && c.tipo === fila.tipo && c.id !== fila.id && c.is_primary
		);
		for (const otro of otros) db.contactos.actualizar(otro.id, { is_primary: false });
	}
});

export const aRespuestaContacto = (fila: ContactoRow): TarjetaContacto => sinEliminado(fila);

export const contactoRutas = rutasHijo({
	coleccion: '/tarjetas/:id/contactos',
	elemento: '/contactos/:rid',
	module: Module.CONTACTO,
	crud: contactoMock,
	aRespuesta: aRespuestaContacto,
	tarjetaDelPadre: (tarjetaId) => tarjetaId,
	padreDeFila: (fila) => fila.tarjeta_id
});
