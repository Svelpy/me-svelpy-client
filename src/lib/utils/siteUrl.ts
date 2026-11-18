/**
 * Normaliza `PUBLIC_SITE_URL` a su origen (`https://dominio.com`, sin barra final ni ruta).
 *
 * Lanza un error si el valor falta o no es una URL http(s) válida, para que un valor mal escrito
 * en las variables de build rompa el build en vez de publicar canonical/Open Graph rotos.
 * Valores con un descuido común como `https:dominio.com` se corrigen solos (`new URL` los acepta).
 */
export function siteOrigin(raw: string | undefined): string {
	const valor = (raw ?? '').trim();
	let url: URL;
	try {
		url = new URL(valor);
	} catch {
		throw new Error(
			`PUBLIC_SITE_URL no es una URL válida: "${valor}". Ejemplo correcto: https://me.svelpy.com`
		);
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		throw new Error(`PUBLIC_SITE_URL debe empezar con https:// (recibido: "${valor}")`);
	}
	return url.origin;
}
