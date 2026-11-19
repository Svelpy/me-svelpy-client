import { z } from 'zod';
import { booleanoOpcional, precioOpcional, texto, textoOpcional, urlImagen } from './common';

export const vitrinaSchema = z.object({
	mostrar_precios: booleanoOpcional(),
	moneda: z
		.string()
		.trim()
		.toUpperCase()
		.regex(/^[A-Z]{3}$/, { message: 'Elige una moneda.' })
		.optional(),
	campo1_nombre: textoOpcional('El nombre del campo', 40),
	campo2_nombre: textoOpcional('El nombre del campo', 40),
	campo3_nombre: textoOpcional('El nombre del campo', 40),
	campo4_nombre: textoOpcional('El nombre del campo', 40)
});

export const vitrinaCategoriaSchema = z.object({
	nombre: texto('El nombre de la categoría', 60),
	is_visible: booleanoOpcional()
});

export const vitrinaItemImagenSchema = z.object({
	url: urlImagen('La imagen'),
	alt: textoOpcional('La descripción de la imagen', 150)
});

const itemBase = z.object({
	titulo: texto('El título', 150),
	descripcion: textoOpcional('La descripción', 1000),
	categoria_id: z
		.string()
		.nullish()
		.transform((valor) => valor || null),
	precio: precioOpcional('El precio'),
	precio_anterior: precioOpcional('El precio anterior'),
	precio_etiqueta: textoOpcional('La etiqueta del precio', 50),
	campo1: textoOpcional('El campo', 100),
	campo2: textoOpcional('El campo', 100),
	campo3: textoOpcional('El campo', 100),
	campo4: textoOpcional('El campo', 100),
	destacado: booleanoOpcional(),
	is_visible: booleanoOpcional(),
	imagenes: z
		.array(vitrinaItemImagenSchema)
		.max(10, { message: 'Hasta 10 imágenes por ítem.' })
		.optional()
});

function validarPrecios(
	item: { precio: number | null; precio_anterior: number | null },
	ctx: z.RefinementCtx
) {
	if (item.precio_anterior === null) return;
	if (item.precio === null) {
		ctx.addIssue({
			code: 'custom',
			path: ['precio_anterior'],
			message: 'Para mostrar un precio anterior, indica primero el precio actual.'
		});
	} else if (item.precio_anterior <= item.precio) {
		ctx.addIssue({
			code: 'custom',
			path: ['precio_anterior'],
			message: 'El precio anterior debe ser mayor que el actual.'
		});
	}
}

export const vitrinaItemSchema = itemBase.superRefine(validarPrecios);

/** Ítem dentro de una tarjeta nueva: apunta a su categoría por nombre */
export const vitrinaItemNuevoSchema = itemBase
	.omit({ categoria_id: true })
	.extend({ categoria_nombre: textoOpcional('La categoría', 60) })
	.superRefine(validarPrecios);

/** Vitrina dentro de una tarjeta nueva, con sus categorías e ítems */
export const vitrinaNuevaSchema = vitrinaSchema
	.extend({
		categorias: z.array(vitrinaCategoriaSchema).max(30).optional(),
		items: z.array(vitrinaItemNuevoSchema).max(100).optional()
	})
	.superRefine((vitrina, ctx) => {
		const nombres = new Set((vitrina.categorias ?? []).map((c) => c.nombre.toLowerCase()));
		vitrina.items?.forEach((item, indice) => {
			if (item.categoria_nombre && !nombres.has(item.categoria_nombre.toLowerCase())) {
				ctx.addIssue({
					code: 'custom',
					path: ['items', indice, 'categoria_nombre'],
					message: 'Esa categoría no está en la vitrina.'
				});
			}
		});
	});
