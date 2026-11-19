/**
 * Cliente HTTP que usan todos los servicios (`src/lib/services`).
 *
 * Hoy responde el backend simulado en localStorage (`src/lib/mocks`). Para usar la API real:
 *   1. Reemplazar la línea de abajo por:
 *        export { apiMeSvelpy as http } from './apiMeSvelpy.config';
 *   2. Borrar la carpeta `src/lib/mocks` y `<DemoAccounts />` del login.
 *   3. Quitar `export const ssr = false` de `src/routes/[slug]/+page.ts`.
 * Interfaces, servicios y componentes no cambian. Se re-exporta (en vez de asignar) para que el
 * import circular config ↔ services no lea el cliente antes de que exista.
 */
export { mockHttp as http } from '#lib/mocks/index.ts';
export type { HttpClient, RequestOptions } from './apiMeSvelpy.config';
