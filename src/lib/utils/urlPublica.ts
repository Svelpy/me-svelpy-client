import { PUBLIC_SITE_URL } from '$app/env/public';
import { siteOrigin } from './siteUrl';

/** Origen público del sitio (https://me.svelpy.com), desde PUBLIC_SITE_URL */
export const ORIGEN_PUBLICO = siteOrigin(PUBLIC_SITE_URL);

/** Dominio que se muestra junto al slug: "me.svelpy.com" */
export const DOMINIO_PUBLICO = new URL(ORIGEN_PUBLICO).host;

/** URL canónica de una tarjeta: la que se comparte, va en el QR y en el SEO */
export function urlPublicaTarjeta(slug: string): string {
	return `${ORIGEN_PUBLICO}/${slug}`;
}

/** Ruta relativa → URL absoluta del sitio; las URLs absolutas (y data:) quedan igual */
export function urlAbsoluta(ruta: string): string {
	return /^(https?:|data:)/i.test(ruta)
		? ruta
		: `${ORIGEN_PUBLICO}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}
