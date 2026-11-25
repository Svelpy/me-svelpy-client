import { SLUG_MAX, SLUG_MIN, SLUG_REGEX, SLUGS_RESERVADOS } from '#lib/constants/slugs.ts';

/**
 * Por qué un slug no se puede usar, sin preguntarle al servidor (formato, largo, reservado).
 * null = el formato está bien; falta saber si está libre.
 */
export function motivoSlugInvalido(slug: string): string | null {
	if (slug.length < SLUG_MIN) return `Usa al menos ${SLUG_MIN} caracteres.`;
	if (slug.length > SLUG_MAX) return `Usa como máximo ${SLUG_MAX} caracteres.`;
	if (!SLUG_REGEX.test(slug)) return 'Usa solo minúsculas, números y guiones simples.';
	if (SLUGS_RESERVADOS.has(slug)) return 'Esa dirección está reservada. Prueba con otra.';
	return null;
}

/**
 * Alternativas para un slug ocupado, de la más natural a la más genérica: con cada pista (rubro,
 * ciudad, apellido) y con un número. Sin repetidos y dentro del largo máximo.
 */
export function alternativasDeSlug(
	slug: string,
	pistas: (string | null | undefined)[] = []
): string[] {
	const recortar = (base: string, sufijo: string) =>
		`${base.slice(0, SLUG_MAX - sufijo.length - 1).replace(/-+$/, '')}-${sufijo}`;
	const candidatos = [
		...pistas
			.map((pista) => slugify(pista ?? ''))
			.filter((pista) => pista && !slug.includes(pista)),
		'2',
		'3',
		String(new Date().getFullYear())
	].map((sufijo) => recortar(slug, sufijo));
	return [...new Set(candidatos)].filter((candidato) => motivoSlugInvalido(candidato) === null);
}

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
