import { defineConfig } from '@playwright/test';

/** Donde escucha la API de prueba (`tests/apiPublica.mjs`) */
const API_PRUEBA = 'http://localhost:4010';

export default defineConfig({
	webServer: [
		{
			// Rutas públicas de la tarjeta, para lo que se arma en el servidor (SSR)
			command: 'node tests/apiPublica.mjs',
			url: `${API_PRUEBA}/salud`,
			reuseExistingServer: !process.env.CI
		},
		{
			// El build apunta a la API de prueba; el resto lo responde cada test con page.route()
			command: 'npm run build && npm run preview',
			port: 4173,
			env: { VITE_API_ENDPOINT: `${API_PRUEBA}/api/v1` },
			timeout: 240_000
		}
	],
	// Con varios webServer, Playwright no deduce la URL de la app
	use: { baseURL: 'http://localhost:4173' },
	testMatch: '**/*.e2e.{ts,js}'
});
