import { VITE_API_ENDPOINT } from '$app/env/public';

export const defaultHeaders: HeadersInit = {
	'Content-Type': 'application/json'
};

export const API_CONFIG = {
	/** Incluye el prefijo de la versión: https://…/api/v1 */
	BASE_URL: VITE_API_ENDPOINT.replace(/\/+$/, ''),
	TIMEOUT: 30000
} as const;

/**
 * Agrega a una ruta los parámetros definidos (`undefined`, `null` y '' se omiten).
 * `conQuery('/tarjetas/', { page: 2, is_public: true })` → `/tarjetas/?page=2&is_public=true`
 */
export function conQuery(
	ruta: string,
	parametros: Record<string, string | number | boolean | null | undefined>
): string {
	const query = new URLSearchParams();
	for (const [clave, valor] of Object.entries(parametros)) {
		if (valor === undefined || valor === null || valor === '') continue;
		query.set(clave, String(valor));
	}
	const texto = query.toString();
	return texto ? `${ruta}?${texto}` : ruta;
}
