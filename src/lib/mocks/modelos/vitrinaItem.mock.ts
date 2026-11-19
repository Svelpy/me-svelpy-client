import { Module } from '#lib/config/permissions.config.ts';
import type { VitrinaItem } from '#lib/interfaces/index.ts';
import { vitrinaItemSchema } from '#lib/zod/vitrina.schema.ts';
import { error, sinEliminado } from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { db, type ItemRow } from '../db/tablas';
import { aRespuestaImagen, imagenMock } from './vitrinaItemImagen.mock';

/** Modelo `vitrina_item`: se crea y actualiza junto con sus imágenes en una sola petición */

const base = crudHijo({
	tabla: db.items,
	padre: 'vitrina_id',
	schema: vitrinaItemSchema,
	nombre: 'El ítem',
	construir: (datos) => ({
		categoria_id: datos.categoria_id,
		titulo: datos.titulo,
		descripcion: datos.descripcion,
		precio: datos.precio,
		precio_anterior: datos.precio_anterior,
		precio_etiqueta: datos.precio_etiqueta,
		campo1: datos.campo1,
		campo2: datos.campo2,
		campo3: datos.campo3,
		campo4: datos.campo4,
		destacado: !!datos.destacado,
		is_visible: datos.is_visible ?? true
	})
});

function campo<T>(cuerpo: unknown, nombre: string): T | undefined {
	if (typeof cuerpo !== 'object' || cuerpo === null || !(nombre in cuerpo)) return undefined;
	return (cuerpo as Record<string, T>)[nombre];
}

/** La categoría tiene que ser de la misma vitrina */
function comprobarCategoria(vitrinaId: string, categoriaId: unknown) {
	if (!categoriaId) return;
	const categoria = db.categorias.buscar(String(categoriaId));
	if (!categoria || categoria.vitrina_id !== vitrinaId) {
		throw error.validacion({ categoria_id: 'Esa categoría no es de esta vitrina.' });
	}
}

function crear(vitrinaId: string, cuerpo: unknown): ItemRow {
	comprobarCategoria(vitrinaId, campo(cuerpo, 'categoria_id'));
	const fila = base.crear(vitrinaId, cuerpo);
	const imagenes = campo<unknown[]>(cuerpo, 'imagenes');
	if (imagenes) imagenMock.reemplazar(fila.id, imagenes);
	return fila;
}

/** Si el cuerpo trae `imagenes`, reemplazan a las anteriores */
function actualizar(id: string, cuerpo: unknown): ItemRow {
	const actual = base.obtener(id);
	const categoria = campo(cuerpo, 'categoria_id');
	if (categoria !== undefined) comprobarCategoria(actual.vitrina_id, categoria);
	const fila = base.actualizar(id, cuerpo);
	const imagenes = campo<unknown[]>(cuerpo, 'imagenes');
	if (imagenes) imagenMock.reemplazar(id, imagenes);
	return fila;
}

function eliminar(id: string): void {
	base.eliminar(id);
	imagenMock.eliminarDelPadre(id);
}

function eliminarDelPadre(vitrinaId: string): void {
	for (const item of base.listar(vitrinaId)) eliminar(item.id);
}

export const itemMock = { ...base, crear, actualizar, eliminar, eliminarDelPadre };

export const aRespuestaItem = (fila: ItemRow): VitrinaItem => ({
	...sinEliminado(fila),
	imagenes: imagenMock.listar(fila.id).map(aRespuestaImagen)
});

export function tarjetaDeVitrina(vitrinaId: string): string {
	const vitrina = db.vitrinas.buscar(vitrinaId);
	if (!vitrina) throw error.noEncontrado('La vitrina no existe.');
	return vitrina.tarjeta_id;
}

export const itemRutas = rutasHijo({
	coleccion: '/vitrinas/:id/items',
	elemento: '/vitrina-items/:rid',
	module: Module.VITRINA,
	crud: itemMock,
	aRespuesta: aRespuestaItem,
	tarjetaDelPadre: tarjetaDeVitrina,
	padreDeFila: (fila) => fila.vitrina_id
});
