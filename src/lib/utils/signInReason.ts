import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';

/** Por qué se llegó al login: se muestra un aviso arriba del formulario */
export const SIGN_IN_REASON_PARAM = 'motivo';

export const SIGN_IN_REASONS = ['protegida', 'expirada', 'password'] as const;
export type SignInReason = (typeof SIGN_IN_REASONS)[number];

export const SIGN_IN_REASON_MESSAGES: Record<SignInReason, string> = {
	protegida: 'Inicia sesión para abrir esa página.',
	expirada: 'Tu sesión terminó. Vuelve a iniciar sesión para continuar.',
	password: 'Tu contraseña cambió. Ingresa con la nueva.'
};

export function isSignInReason(value: unknown): value is SignInReason {
	return typeof value === 'string' && (SIGN_IN_REASONS as readonly string[]).includes(value);
}

/** URL del login con el motivo y la página a la que volver después */
export function signInUrl(
	options: { reason?: SignInReason; redirectTo?: string } = {}
): ResolvedPathname {
	const params = new URLSearchParams();
	if (options.redirectTo) params.set('redirectTo', options.redirectTo);
	if (options.reason) params.set(SIGN_IN_REASON_PARAM, options.reason);
	const query = params.toString();
	// Ruta resuelta más su query: sigue siendo una ruta de la app
	return `${resolve('/auth/sign-in')}${query ? `?${query}` : ''}` as ResolvedPathname;
}
