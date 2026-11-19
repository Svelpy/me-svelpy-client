import type { TarjetaResumen } from './tarjeta.interface';
import type { Usuario } from './usuario.interface';

export interface LoginCredentials {
	email: string;
	password: string;
}

/** Respuesta de `POST /auth/login` y `POST /auth/refresh` */
export interface LoginResponse {
	access_token: string;
	csrf_token: string;
	token_type: 'bearer';
}

export interface AuthTokens {
	accessToken: string;
	/** El refresh_token real viaja en una cookie HttpOnly; aquí se guarda el csrf_token asociado */
	csrfToken: string;
}

/**
 * Respuesta de `GET /users/me`: el usuario de la sesión y el resumen de su tarjeta (null si es
 * superadmin o si aún no tiene). La tarjeta completa se pide aparte con `GET /tarjetas/mia`.
 */
export interface CurrentUser {
	user: Usuario;
	tarjeta: TarjetaResumen | null;
}

/** `PATCH /users/me/password`. Cierra las demás sesiones del usuario */
export interface CambiarPasswordRequest {
	password_actual: string;
	password_nueva: string;
}
