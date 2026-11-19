import { ACCESS_TOKEN_KEY } from '#lib/constants/keys.ts';
import type { LoginResponse } from '#lib/interfaces/auth.interface.ts';
import { ahora, nuevoId, type Sesion } from './contexto';
import { db } from './tablas';

/** Sesiones y contraseñas del backend simulado */

/** Hash SHA-256 de la contraseña (el backend real usa bcrypt o argon2) */
export async function hashPassword(password: string): Promise<string> {
	const datos = new TextEncoder().encode(`me-mock:${password}`);
	const hash = await crypto.subtle.digest('SHA-256', datos);
	const hex = [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
	return `sha256:${hex}`;
}

export async function verificarPassword(password: string, hash: string): Promise<boolean> {
	return (await hashPassword(password)) === hash;
}

export function crearSesion(userId: string): LoginResponse {
	const token = `mock.${nuevoId()}`;
	const csrf = nuevoId();
	db.sesiones.insertar({
		id: token,
		user_id: userId,
		csrf_token: csrf,
		created_at: ahora(),
		is_deleted: false
	});
	return { access_token: token, csrf_token: csrf, token_type: 'bearer' };
}

/** Sesión válida para el token: existe y su usuario sigue activo y sin eliminar */
export function sesionDesdeToken(token: string | null): Sesion | null {
	if (!token) return null;
	const sesion = db.sesiones.buscar(token);
	if (!sesion) return null;
	const usuario = db.usuarios.buscar(sesion.user_id);
	if (!usuario || !usuario.is_active) return null;
	return { usuario, token };
}

export function cerrarSesion(token: string): void {
	if (db.sesiones.buscar(token)) db.sesiones.eliminar(token);
}

/** Cierra todas las sesiones del usuario (salvo `excepto`): al desactivarlo, eliminarlo o cambiar su contraseña */
export function cerrarSesionesDe(userId: string, excepto?: string): void {
	for (const sesion of db.sesiones.donde((s) => s.user_id === userId && s.id !== excepto)) {
		db.sesiones.eliminar(sesion.id);
	}
}

/** Token guardado por `authService` (lo que el cliente real envía en Authorization) */
export function leerTokenGuardado(): string | null {
	try {
		return typeof localStorage === 'undefined' ? null : localStorage.getItem(ACCESS_TOKEN_KEY);
	} catch {
		return null;
	}
}
