import type { TarjetaResumen } from './tarjeta.interface';
import type { TarjetaThemeCreateRequest } from './tarjetaTheme.interface';
import type { UsuarioDetalle } from './usuario.interface';

/** `POST /auth/login` (`UserLogin`) */
export interface LoginCredentials {
	email: string;
	password: string;
}

/** `TokenResponse`: login, refresh y cambio de contraseña. El refresh token va en una cookie HttpOnly */
export interface TokenResponse {
	access_token: string;
	csrf_token: string;
	token_type?: 'bearer';
}

export interface AuthTokens {
	accessToken: string;
	/** Acompaña al refresh token (cookie HttpOnly) en `X-CSRF-Token` */
	csrfToken: string;
}

/**
 * Lo que la sesión guarda del usuario: sus datos con el plan y el resumen de su tarjeta (null si
 * no tiene). La tarjeta completa vive en `miTarjetaStore`.
 */
export interface CurrentUser {
	user: UsuarioDetalle;
	tarjeta: TarjetaResumen | null;
}

/** `POST /auth/change-password` (`ChangePassword`): cierra las demás sesiones y devuelve tokens nuevos */
export interface CambiarPasswordRequest {
	current_password: string;
	new_password: string;
}

/** `TarjetaRegistro`: lo mínimo para empezar; el resto se completa en el editor */
export interface TarjetaRegistroRequest {
	slug: string;
	rubro: string;
	nombres: string;
	prefijo?: string | null;
	apellidos?: string | null;
	cargo?: string | null;
	theme?: TarjetaThemeCreateRequest | null;
}

/**
 * `POST /auth/register` (`UserRegister`): crea el usuario (rol user, plan free, email sin verificar)
 * y su tarjeta, y envía el enlace de verificación. Responde 201 sin contenido y no inicia sesión.
 */
export interface RegistroRequest {
	email: string;
	password: string;
	tarjeta: TarjetaRegistroRequest;
}

/** `POST /auth/forgot-password`: responde 204 exista o no la cuenta */
export interface ForgotPasswordRequest {
	email: string;
}

/** `POST /auth/reset-password`: token del correo, una sola vez; cierra todas las sesiones */
export interface ResetPasswordRequest {
	token: string;
	new_password: string;
}

/** `POST /auth/verify-email`: token del correo, una sola vez */
export interface VerifyEmailRequest {
	token: string;
}
