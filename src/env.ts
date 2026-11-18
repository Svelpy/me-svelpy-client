import { defineEnvVars } from '@sveltejs/kit/env';

// Variables de entorno de SvelteKit 3: se importan desde `$app/env/public`.
// `static: true` las inserta en el bundle al compilar (la landing se prerenderiza).
export const variables = defineEnvVars({
	PUBLIC_SITE_URL: {
		public: true,
		static: true,
		description: 'URL pública del sitio, sin ruta (canonical, Open Graph y JSON-LD).'
	},
	VITE_API_ENDPOINT: {
		public: true,
		static: true,
		description: 'URL base del backend FastAPI.'
	},
	PUBLIC_GA_ID: {
		public: true,
		static: true,
		description: 'ID de medición de Google Analytics 4 (G-XXXXXXXXXX). Opcional: sin él no se carga GA.',
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
