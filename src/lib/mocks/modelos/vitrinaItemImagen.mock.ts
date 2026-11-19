import { z } from 'zod';
import { Module } from '#lib/config/permissions.config.ts';
import type { VitrinaItemImagen } from '#lib/interfaces/index.ts';
import { vitrinaItemImagenSchema } from '#lib/zod/vitrina.schema.ts';
import { ahora, error, nuevoId, sinEliminado, validar } from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { db, type ImagenRow } from '../db/tablas';

/** Modelo `vitrina_item_imagen`: hasta 10 por ítem; la de orden 0 es la principal */

const MAXIMO = 10;

const base = crudHijo({
	tabla: db.imagenes,
	padre: 'item_id',
	schema: vitrinaItemImagenSchema,
	nombre: 'La imagen',
	sinActualizado: true,
	construir: (datos) => ({ url: datos.url, alt: datos.alt }),
	unico: (_datos, itemId) =>
		db.imagenes.donde((imagen) => imagen.item_id === itemId).length >= MAXIMO
			? { campo: 'url', mensaje: `Cada ítem admite hasta ${MAXIMO} imágenes.` }
			: null
});

/** Reemplaza las imágenes del ítem en el orden recibido */
function reemplazar(itemId: string, imagenes: unknown): ImagenRow[] {
	const lista = validar(z.array(vitrinaItemImagenSchema).max(MAXIMO), imagenes);
	base.eliminarDelPadre(itemId);
	const marca = ahora();
	lista.forEach((imagen, orden) => {
		db.imagenes.insertar({
			id: nuevoId(),
			item_id: itemId,
			url: imagen.url,
			alt: imagen.alt,
			orden,
			created_at: marca,
			is_deleted: false
		});
	});
	return base.listar(itemId);
}

export const imagenMock = { ...base, reemplazar };

export const aRespuestaImagen = (fila: ImagenRow): VitrinaItemImagen => sinEliminado(fila);

function tarjetaDeItem(itemId: string): string {
	const item = db.items.buscar(itemId);
	const vitrina = item ? db.vitrinas.buscar(item.vitrina_id) : undefined;
	if (!vitrina) throw error.noEncontrado('El ítem no existe.');
	return vitrina.tarjeta_id;
}

export const imagenRutas = rutasHijo({
	coleccion: '/vitrina-items/:id/imagenes',
	elemento: '/vitrina-item-imagenes/:rid',
	module: Module.VITRINA,
	crud: imagenMock,
	aRespuesta: aRespuestaImagen,
	tarjetaDelPadre: tarjetaDeItem,
	padreDeFila: (fila) => fila.item_id,
	sinEditar: true
});
