/**
 * Cliente HTTP que usan todos los servicios (`src/lib/services`): la API de ME (FastAPI).
 * Se re-exporta (en vez de asignar) para que el import circular config ↔ services no lea el
 * cliente antes de que exista.
 */
export { apiMeSvelpy as http } from './apiMeSvelpy.config';
export type { HttpClient, RequestOptions } from './apiMeSvelpy.config';
