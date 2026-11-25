import { browser } from '$app/env';
import { http } from '#lib/config/http.config.ts';
import type {
	AuthTokens,
	CambiarPasswordRequest,
	CurrentUser,
	LoginCredentials,
	RegistroRequest,
	TokenResponse
} from '#lib/interfaces/index.ts';
import { ErrorCode } from '#lib/interfaces/index.ts';
import {
	ACCESS_TOKEN_KEY,
	CSRF_TOKEN_KEY,
	REFRESH_LOCK_KEY,
	USER_DATA_KEY
} from '#lib/constants/index.ts';
import { AppError } from './error.service';

/** localStorage solo existe en el navegador: en el servidor (SSR del perfil público) no hay sesión */
function almacen(): Storage | null {
	if (!browser) return null;
	try {
		return localStorage;
	} catch {
		return null;
	}
}

class AuthService {
	// Refresh en curso, compartido por todas las peticiones que recibieron 401 a la vez
	private refreshPromise: Promise<string> | null = null;
	private sessionExpiredListeners = new Set<() => void>();

	public static getTokens(): AuthTokens | null {
		const storage = almacen();
		const accessToken = storage?.getItem(ACCESS_TOKEN_KEY);
		const csrfToken = storage?.getItem(CSRF_TOKEN_KEY);
		return accessToken && csrfToken ? { accessToken, csrfToken } : null;
	}

	public static setTokens(tokens: AuthTokens): void {
		const storage = almacen();
		storage?.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
		storage?.setItem(CSRF_TOKEN_KEY, tokens.csrfToken);
	}

	private static guardarRespuesta(response: TokenResponse): void {
		AuthService.setTokens({
			accessToken: response.access_token,
			csrfToken: response.csrf_token
		});
	}

	/** Usuario de la sesión y el resumen de su tarjeta, guardados en localStorage */
	getCurrentUser(): CurrentUser | null {
		try {
			const data = almacen()?.getItem(USER_DATA_KEY);
			return data ? (JSON.parse(data) as CurrentUser) : null;
		} catch {
			return null;
		}
	}

	setCurrentUser(user: CurrentUser): void {
		almacen()?.setItem(USER_DATA_KEY, JSON.stringify(user));
	}

	public static clearAuth(): void {
		const storage = almacen();
		storage?.removeItem(ACCESS_TOKEN_KEY);
		storage?.removeItem(CSRF_TOKEN_KEY);
		storage?.removeItem(USER_DATA_KEY);
	}

	public static isAuthenticated(): boolean {
		return !!this.getTokens()?.accessToken;
	}

	/**
	 * `POST /auth/login`: guarda el access token y el CSRF; el refresh token queda en una cookie
	 * HttpOnly. Los datos del usuario se piden después con `GET /usuarios/me` (`authStore`).
	 */
	async login(credentials: LoginCredentials): Promise<void> {
		try {
			const response = await http.postPublic<TokenResponse>(
				'/auth/login',
				{ email: credentials.email.trim().toLowerCase(), password: credentials.password },
				{ withCredentials: true }
			);
			AuthService.guardarRespuesta(response);
		} catch (error) {
			AuthService.clearAuth();
			throw error;
		}
	}

	/**
	 * `POST /auth/register`: crea la cuenta (rol user, plan free, email sin verificar) con su
	 * tarjeta y envía el enlace de verificación. No inicia sesión: eso lo hace `authStore.registrar`.
	 */
	async registrar(datos: RegistroRequest): Promise<void> {
		await http.postPublic('/auth/register', {
			...datos,
			email: datos.email.trim().toLowerCase()
		});
	}

	/**
	 * `POST /auth/change-password`: cierra las demás sesiones y devuelve tokens nuevos para este
	 * dispositivo, así que la sesión sigue abierta. Un 401 aquí es la contraseña actual incorrecta.
	 */
	async cambiarPassword(datos: CambiarPasswordRequest): Promise<void> {
		const response = await http.post<TokenResponse>('/auth/change-password', datos, {
			requireAuth: true,
			withCredentials: true,
			reintentar401: false
		});
		AuthService.guardarRespuesta(response);
	}

	/** `POST /auth/forgot-password`: responde igual exista o no la cuenta */
	async olvidePassword(email: string): Promise<void> {
		await http.postPublic('/auth/forgot-password', { email: email.trim().toLowerCase() });
	}

	/** `POST /auth/reset-password`: usa el token del correo (una vez) y cierra todas las sesiones */
	async restablecerPassword(token: string, nuevaPassword: string): Promise<void> {
		await http.postPublic('/auth/reset-password', { token, new_password: nuevaPassword });
	}

	/** `POST /auth/verify-email`: usa el token del correo, una sola vez */
	async verificarEmail(token: string): Promise<void> {
		await http.postPublic('/auth/verify-email', { token });
	}

	/** `POST /auth/resend-verification`: un enlace nuevo al email actual (el anterior deja de servir) */
	async reenviarVerificacion(): Promise<void> {
		await http.post('/auth/resend-verification', undefined, { requireAuth: true });
	}

	/** Cierra la sesión en el servidor (revoca el refresh) y borra la local, aunque falle la red */
	async logout(): Promise<void> {
		try {
			await http.postPublic('/auth/logout', undefined, { withCredentials: true });
		} catch {
			// Sin red igual se cierra la sesión local
		} finally {
			AuthService.clearAuth();
		}
	}

	getToken(): string | null {
		return AuthService.getTokens()?.accessToken || null;
	}

	getCsrfToken(): string | null {
		return AuthService.getTokens()?.csrfToken || null;
	}

	/**
	 * Renueva el access token. Las llamadas simultáneas comparten una sola petición: la cookie
	 * refresh_token rota en cada refresh, así que un segundo refresh en paralelo usaría una ya invalidada.
	 * @param staleToken token con el que falló la petición; si ya cambió, otra pestaña renovó la sesión
	 */
	refreshToken(staleToken?: string | null): Promise<string> {
		this.refreshPromise ??= this.withRefreshLock(() => this.performRefresh(staleToken)).finally(
			() => {
				this.refreshPromise = null;
			}
		);
		return this.refreshPromise;
	}

	/** Cierra la sesión local porque el servidor la rechazó y avisa a los suscriptores (p. ej. el store) */
	expireSession(): void {
		AuthService.clearAuth();
		this.sessionExpiredListeners.forEach((listener) => listener());
	}

	/** Suscribe a la expiración de la sesión. Devuelve la función para desuscribirse */
	onSessionExpired(listener: () => void): () => void {
		this.sessionExpiredListeners.add(listener);
		return () => this.sessionExpiredListeners.delete(listener);
	}

	// Web Locks serializa el refresh entre pestañas, que comparten la cookie y el localStorage
	private withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
		if (typeof navigator === 'undefined' || !navigator.locks) return fn();
		return navigator.locks.request(REFRESH_LOCK_KEY, fn);
	}

	private async performRefresh(staleToken?: string | null): Promise<string> {
		// Otra pestaña ya renovó la sesión mientras se esperaba el lock: se reutiliza su token
		const currentToken = this.getToken();
		if (staleToken && currentToken && currentToken !== staleToken) return currentToken;

		const csrfToken = this.getCsrfToken();
		if (!csrfToken) {
			this.expireSession();
			throw new AppError({
				message: 'Tu sesión expiró. Inicia sesión nuevamente.',
				code: ErrorCode.REFRESH_FAILED,
				status: 401
			});
		}

		try {
			// postPublic no envía el access token, así que un 401 aquí no dispara otro refresh.
			// El refresh_token viaja en la cookie HttpOnly.
			const response = await http.postPublic<TokenResponse>('/auth/refresh', undefined, {
				withCredentials: true,
				customHeaders: { 'X-CSRF-Token': csrfToken }
			});

			AuthService.setTokens({
				accessToken: response.access_token,
				csrfToken: response.csrf_token ?? csrfToken
			});
			return response.access_token;
		} catch (error) {
			// Solo el rechazo del servidor cierra la sesión; ante red caída o 5xx se conserva para reintentar
			if (error instanceof AppError && (error.status === 401 || error.status === 403)) {
				this.expireSession();
			}
			throw error;
		}
	}
}

export const authService = new AuthService();
