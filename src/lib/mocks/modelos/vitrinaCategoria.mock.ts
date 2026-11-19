import { Module } from '#lib/config/permissions.config.ts';
import type { VitrinaCategoria } from '#lib/interfaces/index.ts';
import { vitrinaCategoriaSchema } from '#lib/zod/vitrina.schema.ts';
import { ahora, sinEliminado } from '../db/contexto';
import { crudHijo, rutasHijo } from '../db/crudHijo';
import { db, type CategoriaRow } from '../db/tablas';
import { tarjetaDeVitrina } from './vitrinaItem.mock';

/** Modelo `vitrina_categoria`: nombre único por vitrina; al eliminarla, sus ítems quedan sin categoría */

const base = crudHijo({
	tabla: db.categorias,
	padre: 'vitrina_id',
	schema: vitrinaCategoriaSchema,
	nombre: 'La categoría',
	construir: (datos) => ({ nombre: datos.nombre, is_visible: datos.is_visible ?? true }),
	unico: (datos, vitrinaId, idActual) => {
		const repetida = db.categorias.donde(
			(c) =>
				c.vitrina_id === vitrinaId &&
				c.id !== idActual &&
				c.nombre.toLowerCase() === datos.nombre.toLowerCase()
		);
		return repetida.length > 0
			? { campo: 'nombre', mensaje: 'Ya tienes una categoría con ese nombre.' }
			: null;
	}
});

function eliminar(id: string): void {
	base.eliminar(id);
	for (const item of db.items.donde((i) => i.categoria_id === id)) {
		db.items.actualizar(item.id, { categoria_id: null, updated_at: ahora() });
	}
}

export const categoriaMock = { ...base, eliminar };

export const aRespuestaCategoria = (fila: CategoriaRow): VitrinaCategoria => sinEliminado(fila);

export const categoriaRutas = rutasHijo({
	coleccion: '/vitrinas/:id/categorias',
	elemento: '/vitrina-categorias/:rid',
	module: Module.VITRINA,
	crud: categoriaMock,
	aRespuesta: aRespuestaCategoria,
	tarjetaDelPadre: tarjetaDeVitrina,
	padreDeFila: (fila) => fila.vitrina_id
});
