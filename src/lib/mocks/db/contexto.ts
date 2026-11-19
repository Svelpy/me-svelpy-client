import type { ZodType } from 'zod';
import { Action, Role, type Module } from '#lib/config/permissions.config.ts';
import { ErrorCode } from '#lib/interfaces/error.interface.ts';
import type { PaginatedResponse } from '#lib/interfaces/pagination.interface.ts';
import { AppError } from '#lib/services/error.service.ts';
import { can, isRole } from '#lib/utils/rbac.utils.ts';
import { validateSchema } from '#lib/utils/validateSchema.ts';
import { db, type FilaBase, type TarjetaRow, type UsuarioRow } from './tablas';

/** Lo que comparten las rutas del backend simulado: sesión, permisos, errores y utilidades */

export interface Sesion {
	usuario: UsuarioRow;
	token: string;
}

export type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ContextoRuta {
	params: Record<string, string>;
	query: URLSearchParams;
	cuerpo: unknown;
	sesion: Sesion | null;
}

export interface RutaMock {
	metodo: Metodo;
	/** '/tarjetas/:id/contactos' */
	patron: string;
	/** Sin sesión (login, tarjeta pública) */
	publica?: boolean;
	manejar: (ctx: ContextoRuta) => unknown | Promise<unknown>;
}

export const nuevoId = (): string => crypto.randomUUID();
export const ahora = (): string => new Date().toISOString();

/** Errores con el mismo formato que la API (AppError con code, status y details) */
export const error = {
	noEncontrado: (message: string) =>
		new AppError({ message, code: ErrorCode.RESOURCE_NOT_FOUND, status: 404 }),
	prohibido: (message = 'No tienes permisos para realizar esta acción.') =>
		new AppError({ message, code: ErrorCode.PERMISSION_DENIED, status: 403 }),
	conflicto: (message: string, details: Record<string, string> = {}) =>
		new AppError({ message, code: ErrorCode.CONFLICT, status: 409, details }),
	validacion: (details: Record<string, string>, message = 'Revisa los datos marcados.') =>
		new AppError({ message, code: ErrorCode.VALIDATION_ERROR, status: 422, details }),
	noAutenticado: (message = 'Tu sesión expiró. Inicia sesión nuevamente.') =>
		new AppError({ message, code: ErrorCode.TOKEN_INVALID, status: 401 })
};

/** Valida el cuerpo como lo haría el backend: 422 con el primer error de cada campo */
export function validar<T>(schema: ZodType<T>, datos: unknown): T {
	const resultado = validateSchema(schema, datos);
	if (!resultado.success) throw error.validacion(resultado.errors);
	return resultado.data;
}

export function exigirSesion(ctx: ContextoRuta): Sesion {
	if (!ctx.sesion) throw error.noAutenticado('Debes iniciar sesión para continuar.');
	return ctx.sesion;
}

export function rolDe(sesion: Sesion): Role | null {
	return isRole(sesion.usuario.rol) ? sesion.usuario.rol : null;
}

export function esSuperadmin(sesion: Sesion): boolean {
	return rolDe(sesion) === Role.SUPERADMIN;
}

/** Equivale a `has_permission` del backend */
export function exigirPermiso(sesion: Sesion, module: Module, action: Action): void {
	if (!can(rolDe(sesion), module, action)) throw error.prohibido();
}

/** La tarjeta, si la sesión puede trabajar sobre ella: el superadmin sobre todas, el owner sobre la suya */
export function exigirAccesoTarjeta(sesion: Sesion, tarjetaId: string): TarjetaRow {
	const tarjeta = db.tarjetas.buscar(tarjetaId);
	if (!tarjeta) throw error.noEncontrado('La tarjeta no existe.');
	if (!esSuperadmin(sesion) && tarjeta.user_id !== sesion.usuario.id) {
		throw error.prohibido('Solo puedes modificar tu propia tarjeta.');
	}
	return tarjeta;
}

/** Marca la tarjeta como modificada (orden de "recientes" en el panel) */
export function tocarTarjeta(tarjetaId: string): void {
	if (db.tarjetas.buscar(tarjetaId)) db.tarjetas.actualizar(tarjetaId, { updated_at: ahora() });
}

/** La fila como la devuelve la API: sin `is_deleted` */
export function sinEliminado<T extends FilaBase>(fila: T): Omit<T, 'is_deleted'> {
	const { is_deleted: _eliminado, ...resto } = fila;
	return resto;
}

export function porOrden<T extends { orden: number }>(a: T, b: T): number {
	return a.orden - b.orden;
}

export function siguienteOrden(filas: { orden: number }[]): number {
	return filas.length === 0 ? 0 : Math.max(...filas.map((f) => f.orden)) + 1;
}

/** Paginación estándar de la API (`page`, `per_page` de 1 a 100) */
export function paginar<T>(items: T[], query: URLSearchParams): PaginatedResponse<T> {
	const page = Math.max(1, Math.trunc(Number(query.get('page')) || 1));
	const perPage = Math.min(100, Math.max(1, Math.trunc(Number(query.get('per_page')) || 20)));
	const total = items.length;
	return {
		total,
		page,
		per_page: perPage,
		total_pages: Math.max(1, Math.ceil(total / perPage)),
		data: items.slice((page - 1) * perPage, page * perPage)
	};
}

export { Action };
