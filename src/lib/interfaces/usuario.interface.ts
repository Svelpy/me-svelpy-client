import type { AssignableUserRole, Role } from '#lib/config/permissions.config.ts';
import type { Timestamps } from './common.interface';
import type { PaginationParams } from './pagination.interface';
import type { TarjetaCompleta, TarjetaNuevaRequest, TarjetaResumen } from './tarjeta.interface';

/**
 * Rol tal como llega de la API. Admite roles que el frontend aún no conoce:
 * validar con `isRole()` antes de usarlo para permisos (lo desconocido se deniega).
 */
export type UserRole = Role | (string & {});

/** Fila de `usuario` sin `password_hash` (la API nunca lo devuelve) */
export interface Usuario extends Timestamps {
	id: string;
	email: string;
	rol: UserRole;
	is_active: boolean;
	last_login_at: string | null;
}

/** Usuario del listado (`GET /usuarios`) con el resumen de su tarjeta, si tiene */
export interface UsuarioListItem extends Usuario {
	tarjeta: TarjetaResumen | null;
}

/**
 * `POST /usuarios`. Con `tarjeta` se crea también su tarjeta con todo su contenido
 * (tema, SEO, secciones, contactos, redes…) en la misma petición.
 */
export interface UsuarioCreateRequest {
	email: string;
	password: string;
	rol: AssignableUserRole;
	/** Por defecto true */
	is_active?: boolean;
	tarjeta?: TarjetaNuevaRequest;
}

/** Respuesta de `POST /usuarios`: el usuario y la tarjeta creada (null si no se pidió) */
export interface UsuarioCreateResponse extends Usuario {
	tarjeta: TarjetaCompleta | null;
}

/** `PATCH /usuarios/{id}` */
export interface UsuarioUpdateRequest {
	email?: string;
	rol?: AssignableUserRole;
	is_active?: boolean;
}

/** `PUT /usuarios/{id}/password`: el superadmin define una contraseña nueva (cierra sus sesiones) */
export interface UsuarioPasswordRequest {
	password: string;
}

export type UsuarioEstado = 'activo' | 'inactivo';

/** Filtros de `GET /usuarios` */
export interface UsuarioFiltros extends PaginationParams {
	/** Busca en el email y en el nombre de su tarjeta */
	q?: string;
	rol?: Role;
	estado?: UsuarioEstado;
}
