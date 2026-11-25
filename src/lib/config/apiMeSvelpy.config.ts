import { ErrorCode } from '#lib/interfaces/index.ts';
import { AppError, authService, errorService } from '#lib/services/index.ts';
import { API_CONFIG, defaultHeaders } from './api.config';

export interface RequestOptions {
	/**
	 * true: exige sesión (sin token falla antes de llamar). false: nunca envía el token.
	 * Sin definir: envía el token si hay sesión (rutas con sesión opcional).
	 */
	requireAuth?: boolean;
	customHeaders?: HeadersInit;
	/** Enviar y recibir cookies (el refresh token HttpOnly) */
	withCredentials?: boolean;
	/** Milisegundos de espera; por defecto `API_CONFIG.TIMEOUT` */
	timeout?: number;
	/**
	 * El `fetch` del `load` de SvelteKit. En el servidor (SSR) permite que la respuesta viaje dentro
	 * del HTML y que el navegador no repita la petición al hidratar.
	 */
	fetch?: typeof fetch;
	/**
	 * Con un 401, renovar el token y reintentar una vez (por defecto true). Se apaga donde un 401
	 * significa otra cosa, como una contraseña actual incorrecta.
	 */
	reintentar401?: boolean;
}

class ApiMeSvelpy {
	// Token a enviar en la petición. Por defecto se envía si existe
	private resolveToken(options: RequestOptions): string | null {
		if (options.requireAuth === false) return null;

		const token = authService.getToken();
		if (!token && options.requireAuth === true) {
			throw new AppError({
				message: 'Debes iniciar sesión para continuar.',
				code: ErrorCode.TOKEN_REQUIRED,
				status: 401
			});
		}
		return token;
	}

	private buildHeaders(options: RequestOptions, token: string | null): Record<string, string> {
		const headers: Record<string, string> = { ...(defaultHeaders as Record<string, string>) };
		if (options.customHeaders) Object.assign(headers, options.customHeaders);
		if (token) headers.Authorization = `Bearer ${token}`;
		return headers;
	}

	private async send(
		endpoint: string,
		method: string,
		data: unknown,
		options: RequestOptions,
		token: string | null
	): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? API_CONFIG.TIMEOUT);

		try {
			const headers = this.buildHeaders(options, token);
			// FormData y URLSearchParams: el navegador pone el Content-Type (con su boundary)
			const isRawBody = data instanceof FormData || data instanceof URLSearchParams;
			if (isRawBody) delete headers['Content-Type'];
			const body =
				data === undefined ? undefined : isRawBody ? (data as BodyInit) : JSON.stringify(data);

			const fetcher = options.fetch ?? fetch;
			return await fetcher(`${API_CONFIG.BASE_URL}${endpoint}`, {
				method,
				headers,
				body,
				credentials: options.withCredentials ? 'include' : 'same-origin',
				signal: controller.signal
			});
		} finally {
			clearTimeout(timeoutId);
		}
	}

	/** Cuerpo JSON de una respuesta exitosa; `undefined` si no trae (201 del registro, 204) */
	private async leerJson<T>(response: Response): Promise<T> {
		const texto = await response.text();
		return (texto ? JSON.parse(texto) : undefined) as T;
	}

	private async request<T>(
		endpoint: string,
		method: string,
		data?: unknown,
		options: RequestOptions = {},
		parse?: (response: Response) => Promise<T>
	): Promise<T> {
		try {
			const token = this.resolveToken(options);
			let response = await this.send(endpoint, method, data, options, token);

			// Access token vencido: se renueva (una sola vez) y se reintenta la petición
			if (response.status === 401 && token && options.reintentar401 !== false) {
				const newToken = await authService.refreshToken(token);
				response = await this.send(endpoint, method, data, options, newToken);
				if (response.status === 401) authService.expireSession();
			}

			if (!response.ok) throw await errorService.fromResponse(response);

			return parse ? await parse(response) : await this.leerJson<T>(response);
		} catch (error) {
			const appError = errorService.fromUnknown(error);
			errorService.log(appError);
			throw appError;
		}
	}

	async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'GET', undefined, options);
	}

	/** GET de un archivo: devuelve el cuerpo como Blob. Los errores llegan en JSON */
	async getBlob(endpoint: string, options: RequestOptions = {}): Promise<Blob> {
		return this.request<Blob>(endpoint, 'GET', undefined, options, (response) => response.blob());
	}

	async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'POST', data, options);
	}

	async put<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'PUT', data, options);
	}

	async patch<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'PATCH', data, options);
	}

	async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'DELETE', undefined, options);
	}

	/** GET sin token (perfil público, planes visibles) */
	async getPublic<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		return this.get<T>(endpoint, { ...options, requireAuth: false });
	}

	/** POST sin token (login, registro, recuperar contraseña…) */
	async postPublic<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
		return this.post<T>(endpoint, data, { ...options, requireAuth: false });
	}
}

export const apiMeSvelpy = new ApiMeSvelpy();

export type HttpClient = Pick<
	ApiMeSvelpy,
	'get' | 'getBlob' | 'post' | 'put' | 'patch' | 'delete' | 'getPublic' | 'postPublic'
>;
