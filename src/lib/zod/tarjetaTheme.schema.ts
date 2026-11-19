import { z } from 'zod';
import { TEMA_PRESETS } from '#lib/config/temasTarjeta.config.ts';
import { esTipografiaValida } from '#lib/config/tipografiasTarjeta.config.ts';
import type { TemaPreset } from '#lib/interfaces/index.ts';
import { SECCIONES_ORDEN_POR_DEFECTO } from '#lib/config/seccionesTarjeta.config.ts';
import { booleanoOpcional, colorHex, textoOpcional, urlImagenOpcional } from './common';

/** Tema, SEO y secciones: lo que nace con cada tarjeta y solo se edita */

export const tarjetaThemeSchema = z.object({
	preset: z.enum(TEMA_PRESETS as [TemaPreset, ...TemaPreset[]]).nullable(),
	tipografia: z
		.number({ message: 'Elige una tipografía.' })
		.int()
		.refine(esTipografiaValida, { message: 'Elige una tipografía de la lista.' }),
	color_fondo: colorHex('El fondo'),
	color_superficie: colorHex('El color de las secciones'),
	color_borde: colorHex('El color de los bordes'),
	color_titulo: colorHex('El color de los títulos'),
	color_texto: colorHex('El color del texto'),
	color_texto_secundario: colorHex('El color del texto secundario'),
	color_primario: colorHex('El color principal'),
	color_texto_sobre_primario: colorHex('El texto sobre el color principal'),
	color_secundario: colorHex('El color secundario'),
	color_texto_sobre_secundario: colorHex('El texto sobre el color secundario'),
	color_overlay_portada: colorHex('El velo de la portada'),
	overlay_opacidad: z
		.number({ message: 'La opacidad va de 0 a 100.' })
		.int()
		.min(0, { message: 'La opacidad va de 0 a 100.' })
		.max(100, { message: 'La opacidad va de 0 a 100.' }),
	color_precio: colorHex('El color de los precios'),
	color_destacado: colorHex('El color de "Destacado"'),
	color_texto_sobre_destacado: colorHex('El texto sobre "Destacado"'),
	color_icono: colorHex('El color de los íconos'),
	color_fondo_icono: colorHex('El fondo de los íconos'),
	icono_forma: z.enum(['circulo', 'redondeado', 'cuadrado', 'ninguno']),
	color_icono_social: colorHex('El color de los íconos de redes'),
	color_fondo_icono_social: colorHex('El fondo de los íconos de redes'),
	color_fab_fondo: colorHex('El fondo del botón flotante'),
	color_fab_icono: colorHex('El ícono del botón flotante'),
	fab_posicion: z.enum(['derecha', 'izquierda'])
});

export const tarjetaSeoSchema = z.object({
	meta_title: textoOpcional('El título para Google', 70),
	meta_description: textoOpcional('La descripción para Google', 160),
	og_image_url: urlImagenOpcional('La imagen para compartir'),
	robots_index: z.boolean({ message: 'Indica si Google puede mostrar la tarjeta.' })
});

export const SECCION_CLAVES = SECCIONES_ORDEN_POR_DEFECTO as [
	(typeof SECCIONES_ORDEN_POR_DEFECTO)[number],
	...(typeof SECCIONES_ORDEN_POR_DEFECTO)[number][]
];

export const tarjetaSeccionInputSchema = z.object({
	clave: z.enum(SECCION_CLAVES, { message: 'Sección desconocida.' }),
	titulo: textoOpcional('El título de la sección', 80),
	is_visible: booleanoOpcional(),
	orden: z.number().int().min(0).optional()
});

/** Cuerpo de `PUT /tarjetas/{id}/secciones`: las 9, sin repetir */
export const tarjetaSeccionesUpdateSchema = z.object({
	secciones: z
		.array(
			z.object({
				clave: z.enum(SECCION_CLAVES),
				titulo: textoOpcional('El título de la sección', 80),
				is_visible: z.boolean(),
				orden: z.number().int().min(0)
			})
		)
		.length(SECCION_CLAVES.length, { message: 'Envía las 9 secciones.' })
		.refine((secciones) => new Set(secciones.map((s) => s.clave)).size === secciones.length, {
			message: 'Hay secciones repetidas.'
		})
});
