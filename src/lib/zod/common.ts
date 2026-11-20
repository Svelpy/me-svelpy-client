import { z } from 'zod';
import { SLUG_MAX, SLUG_MIN, SLUG_REGEX, SLUGS_RESERVADOS } from '#lib/constants/slugs.ts';

/** Piezas comunes de los esquemas: textos, URLs, fechas, colores y precios con mensajes en español */

/** Texto obligatorio, sin espacios a los lados */
export const texto = (etiqueta: string, max: number) =>
	z
		.string({ message: `${etiqueta} es obligatorio.` })
		.trim()
		.min(1, { message: `${etiqueta} es obligatorio.` })
		.max(max, { message: `${etiqueta} admite hasta ${max} caracteres.` });

/** Texto opcional: vacío o ausente se guarda como null */
export const textoOpcional = (etiqueta: string, max: number) =>
	z
		.string()
		.trim()
		.max(max, { message: `${etiqueta} admite hasta ${max} caracteres.` })
		.nullish()
		.transform((valor) => valor || null);

/** Aplica `schema` solo si hay valor; vacío o ausente queda en null */
const siHayValor = (schema: z.ZodType<string, string>) =>
	z
		.string()
		.trim()
		.nullish()
		.transform((valor) => valor || null)
		.pipe(schema.nullable());

function esUrlHttps(valor: string): boolean {
	try {
		return new URL(valor).protocol === 'https:';
	} catch {
		return false;
	}
}

/** Enlace https obligatorio */
export const urlHttps = (etiqueta: string) =>
	texto(etiqueta, 2048).refine(esUrlHttps, {
		message: `${etiqueta}: usa un enlace que empiece con https://`
	});

/** Enlace https opcional */
export const urlHttpsOpcional = (etiqueta: string) =>
	siHayValor(
		z
			.string()
			.max(2048)
			.refine(esUrlHttps, {
				message: `${etiqueta}: usa un enlace que empiece con https://`
			})
	);

/**
 * Imagen: URL https. También acepta `data:image/…` porque es lo que devuelven las subidas de los
 * datos de prueba; la API real siempre devuelve https.
 */
const esUrlImagen = (valor: string) =>
	esUrlHttps(valor) || /^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(valor);

export const urlImagen = (etiqueta: string) =>
	z
		.string({ message: `${etiqueta} es obligatoria.` })
		.trim()
		.min(1, { message: `${etiqueta} es obligatoria.` })
		.refine(esUrlImagen, { message: `${etiqueta}: la imagen no es válida.` });

export const urlImagenOpcional = (etiqueta: string) =>
	siHayValor(z.string().refine(esUrlImagen, { message: `${etiqueta}: la imagen no es válida.` }));

function esFechaValida(valor: string): boolean {
	const [anio, mes, dia] = valor.split('-').map(Number);
	const fecha = new Date(anio, mes - 1, dia);
	return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
}

/** Fecha YYYY-MM-DD opcional */
export const fechaOpcional = (etiqueta: string) =>
	siHayValor(
		z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/, { message: `${etiqueta}: usa el formato AAAA-MM-DD.` })
			.refine(esFechaValida, { message: `${etiqueta} no es una fecha válida.` })
	);

/** Color #RRGGBB, guardado en mayúsculas */
export const colorHex = (etiqueta: string) =>
	z
		.string({ message: `${etiqueta} es obligatorio.` })
		.trim()
		.regex(/^#[0-9a-fA-F]{6}$/, { message: `${etiqueta}: usa un color hex como #2A182D.` })
		.transform((valor) => valor.toUpperCase());

/** numeric(12,2) opcional y no negativo */
export const precioOpcional = (etiqueta: string) =>
	z
		.number({ message: `${etiqueta}: ingresa un número.` })
		.min(0, { message: `${etiqueta} no puede ser negativo.` })
		.max(9_999_999_999.99, { message: `${etiqueta} es demasiado alto.` })
		.nullish()
		.transform((valor) =>
			valor === null || valor === undefined ? null : Math.round(valor * 100) / 100
		);

export const booleanoOpcional = () => z.boolean().optional();

export function esEmail(valor: string): boolean {
	return z.email().safeParse(valor).success;
}

export const emailSchema = z
	.string({ message: 'Ingresa un correo.' })
	.trim()
	.toLowerCase()
	.min(1, { message: 'Ingresa un correo.' })
	.max(255, { message: 'El correo admite hasta 255 caracteres.' })
	.refine(esEmail, { message: 'Ingresa un correo válido, como nombre@dominio.com.' });

export const passwordSchema = z
	.string({ message: 'Ingresa una contraseña.' })
	.min(8, { message: 'Usa al menos 8 caracteres.' })
	.max(72, { message: 'Usa como máximo 72 caracteres.' })
	.regex(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/, { message: 'Incluye al menos una letra.' })
	.regex(/\d/, { message: 'Incluye al menos un número.' });

export const slugSchema = z
	.string({ message: 'Elige el enlace de la tarjeta.' })
	.trim()
	.toLowerCase()
	.min(SLUG_MIN, { message: `El enlace necesita al menos ${SLUG_MIN} caracteres.` })
	.max(SLUG_MAX, { message: `El enlace admite hasta ${SLUG_MAX} caracteres.` })
	.regex(SLUG_REGEX, {
		message: 'Usa solo minúsculas, números y guiones, sin guion al inicio ni al final.'
	})
	.refine((slug) => !SLUGS_RESERVADOS.has(slug), {
		message: 'Ese enlace está reservado. Elige otro.'
	});
