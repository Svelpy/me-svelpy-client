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
