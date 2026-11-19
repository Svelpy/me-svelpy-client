import type { HttpClient, RequestOptions } from '#lib/config/apiMeSvelpy.config.ts';
import { ErrorCode } from '#lib/interfaces/error.interface.ts';
import { AppError, errorService } from '#lib/services/error.service.ts';
import { error, type Metodo } from './db/contexto';
import { leerTokenGuardado, sesionDesdeToken } from './db/sesion';
import { buscarRuta } from './router';
import { prepararDatosDePrueba } from './seed';

/**
 * Cliente HTTP de prueba con la misma interfaz que `apiMeSvelpy`: en vez de llamar a la API,
 * despacha cada petición al backend simulado. Imita la latencia de red, la autenticación por
 * token y el formato de errores (todo lo que sale es AppError).
 */

/** Unos cientos de ms para que se vean los estados de carga; casi nada en tests */
function latencia(): number {
	if (typeof window === 'undefined') return 0;
	if (navigator.webdriver) return 15;
	return 180 + Math.random() * 340;
}

function esperar(ms: number): Promise<void> {
	return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

/** FormData y URLSearchParams → objeto; lo demás se copia para que nadie comparta referencias */
function normalizarCuerpo(cuerpo: unknown): unknown {
	if (cuerpo === undefined || cuerpo === null) return undefined;
	if (cuerpo instanceof URLSearchParams) return Object.fromEntries(cuerpo);
	if (typeof FormData !== 'undefined' && cuerpo instanceof FormData) {
		return Object.fromEntries(cuerpo.entries());
	}
	return structuredClone(cuerpo);
}

/** Igual que el cliente real: un token que el servidor rechaza cierra la sesión local */
async function expirarSesionLocal(): Promise<void> {
	const { authService } = await import('#lib/services/auth.service.ts');
	authService.expireSession();
}

class MockHttp implements HttpClient {
	private async request<T>(
		endpoint: string,
		metodo: Metodo,
		cuerpo?: unknown,
		options: RequestOptions = {}
	): Promise<T> {
		try {
			await prepararDatosDePrueba();
			await esperar(latencia());

			const url = new URL(endpoint, 'http://me.mock');
			const encontrada = buscarRuta(metodo, url.pathname);
			if (!encontrada) throw error.noEncontrado('El recurso solicitado no existe.');

			const token = options.requireAuth === false ? null : leerTokenGuardado();
			if (options.requireAuth === true && !token) {
				throw new AppError({
					message: 'Debes iniciar sesión para continuar.',
					code: ErrorCode.TOKEN_REQUIRED,
					status: 401
				});
			}
			const sesion = sesionDesdeToken(token);
			if (!encontrada.ruta.publica && !sesion) {
				if (token) await expirarSesionLocal();
				throw error.noAutenticado();
			}

			const resultado = await encontrada.ruta.manejar({
				params: encontrada.params,
				query: url.searchParams,
				cuerpo: normalizarCuerpo(cuerpo),
				sesion
			});
			// Copia: la UI nunca toca las filas guardadas
			return structuredClone(resultado ?? {}) as T;
		} catch (causa) {
			const appError = errorService.fromUnknown(causa);
			errorService.log(appError);
			throw appError;
		}
	}

	get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'GET', undefined, options);
	}

	async getBlob(_endpoint: string, _options: RequestOptions = {}): Promise<Blob> {
		throw new AppError({
			message: 'Las descargas de archivos no están disponibles con los datos de prueba.',
			code: ErrorCode.APP_ERROR,
			status: 501
		});
	}

	post<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'POST', data, options);
	}

	put<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'PUT', data, options);
	}

	patch<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'PATCH', data, options);
	}

	delete<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'DELETE', data, options);
	}

	getPublic<T>(endpoint: string): Promise<T> {
		return this.get<T>(endpoint, { requireAuth: false });
	}

	postPublic<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
		return this.post<T>(endpoint, data, { ...options, requireAuth: false });
	}
}

export const mockHttp: HttpClient = new MockHttp();
