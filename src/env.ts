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
	}
});
