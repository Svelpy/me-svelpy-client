import { SLUG_MAX } from '#lib/constants/slugs.ts';

/** "Dra. Fabiola Méndez" → "dra-fabiola-mendez" */
export function slugify(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, SLUG_MAX)
		.replace(/-+$/, '');
}

/** Slug sugerido para una tarjeta nueva a partir del nombre */
export function sugerirSlug(partes: {
	prefijo?: string | null;
	nombres?: string | null;
	apellidos?: string | null;
}): string {
	const primerApellido = partes.apellidos?.trim().split(/\s+/)[0] ?? '';
	return slugify([partes.prefijo, partes.nombres, primerApellido].filter(Boolean).join(' '));
}

/**
 * Lo que se escribe en el campo de la dirección, ya como dirección: sin tildes ni mayúsculas, con
 * guiones en lugar de espacios y signos. A diferencia de `slugify`, deja un guion al final para
 * que se pueda seguir escribiendo ("rocio-" → "rocio-suarez").
 */
export function limpiarSlugEscrito(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+/, '')
		.slice(0, SLUG_MAX);
}
