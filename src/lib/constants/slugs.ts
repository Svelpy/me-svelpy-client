/**
 * Direcciones que no puede usar una tarjeta (me.svelpy.com/{slug}): rutas de la app, archivos
 * públicos y palabras de la marca. Las rutas estáticas de SvelteKit ganan a `/[slug]`, pero así
 * nadie reserva una dirección que nunca vería.
 */
export const SLUGS_RESERVADOS: ReadonlySet<string> = new Set([
	'admin',
	'administrador',
	'api',
	'app',
	'assets',
	'auth',
	'ayuda',
	'blog',
	'configuracion',
	'contacto',
	'cookies',
	'cuenta',
	'demo',
	'editar',
	'ejemplo',
	'favicon',
	'images',
	'img',
	'legal',
	'llms',
	'login',
	'logout',
	'me',
	'nueva',
	'nuevo',
	'panel',
	'perfil',
	'planes',
	'precios',
	'privacidad',
	'public',
	'publico',
	'registro',
	'robots',
	'sign-in',
	'sign-up',
	'sitemap',
	'soporte',
	'static',
	'svelpy',
	'tarjeta',
	'tarjetas',
	'terminos',
	'usuarios',
	'www'
]);

/** Formato de un slug: minúsculas, números y guiones simples, sin guion al inicio ni al final */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_MIN = 3;
export const SLUG_MAX = 80;
