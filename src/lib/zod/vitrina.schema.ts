import { z } from 'zod';
import { LIMITES_TARJETA } from '#lib/constants/limites.ts';
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
	/** La imagen que ya tenía el ítem (sin id = nueva) */
	id: z.string().nullish(),
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
		.max(LIMITES_TARJETA.imagenes, {
			message: `Hasta ${LIMITES_TARJETA.imagenes} imágenes por ítem.`
		})
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
