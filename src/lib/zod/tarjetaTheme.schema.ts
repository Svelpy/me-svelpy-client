import { z } from 'zod';
import { esTipografiaValida } from '#lib/config/tipografiasTarjeta.config.ts';
import { colorHex, textoOpcional, urlImagenOpcional } from './common';

/** Tema y SEO: nacen con cada tarjeta y solo se editan (`PATCH` por su id) */

/**
 * El tema editado en el panel. Se valida completo, pero a la API se envía solo lo que cambió
 * (`cambiosDeTema`). La API no recibe `preset`: lo reconoce el panel comparando colores.
 */
export const tarjetaThemeSchema = z.object({
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

/** Título propio de una sección (null = el título por defecto) */
export const tituloSeccionSchema = z.object({
	titulo: textoOpcional('El título de la sección', 80)
});
