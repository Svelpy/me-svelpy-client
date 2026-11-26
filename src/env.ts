import { defineEnvVars } from '@sveltejs/kit/env';

// Variables de entorno de SvelteKit 3: se importan desde `$app/env/public`.
// `static: true` las inserta en el bundle al compilar (la landing se prerenderiza), así que cada
// `schema` corre en el build: una variable que falta o está mal frena el deploy en vez de publicar
// un sitio roto. En Cloudflare Workers Builds se definen en "Variables de compilación".

const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/;

/** Una URL absoluta con https (http solo en la máquina local, para dev y E2E) */
function urlSegura(nombre: string, valor: string | undefined, ejemplo: string): URL {
	const texto = valor?.trim();
	if (!texto) throw new Error(`Falta ${nombre}. Ejemplo: ${ejemplo}`);
	let url: URL;
	try {
		url = new URL(texto);
	} catch {
		throw new Error(`${nombre} no es una URL válida: "${texto}". Ejemplo: ${ejemplo}`);
	}
	const local = url.protocol === 'http:' && LOCAL.test(url.hostname);
	if (url.protocol !== 'https:' && !local) {
		throw new Error(`${nombre} debe usar https:// (recibido: "${texto}")`);
	}
	return url;
}

export const variables = defineEnvVars({
	PUBLIC_SITE_URL: {
		public: true,
		static: true,
		description: 'URL pública del sitio, sin ruta (canonical, Open Graph y JSON-LD).',
		schema: (valor) => {
			const url = urlSegura('PUBLIC_SITE_URL', valor, 'https://me.svelpy.com');
			if (url.pathname !== '/' || url.search || url.hash) {
				throw new Error(`PUBLIC_SITE_URL va sin ruta: usa "${url.origin}"`);
			}
			return url.origin;
		}
	},
	VITE_API_ENDPOINT: {
		public: true,
		static: true,
		description: 'URL base del backend FastAPI, con el prefijo de la versión (…/api/v1).',
		schema: (valor) => {
			const url = urlSegura('VITE_API_ENDPOINT', valor, 'https://api.svelpy.com/api/v1');
			const ruta = url.pathname.replace(/\/+$/, '');
			if (!ruta.endsWith('/api/v1')) {
				throw new Error(`VITE_API_ENDPOINT debe terminar en /api/v1 (recibido: "${valor}")`);
			}
			return url.origin + ruta;
		}
	},
	PUBLIC_GA_ID: {
		public: true,
		static: true,
		description:
			'ID de medición de Google Analytics 4 (G-XXXXXXXXXX). Opcional: sin él no se carga GA.',
		schema: (valor) => {
			const id = valor?.trim();
			if (!id) return undefined;
			if (!/^G-[A-Z0-9]+$/.test(id)) {
				throw new Error(`PUBLIC_GA_ID debe tener el formato G-XXXXXXXXXX (recibido: "${id}")`);
			}
			return id;
		}
	}
});
