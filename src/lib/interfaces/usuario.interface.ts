import type { AssignableUserRole, Role } from '#lib/config/permissions.config.ts';
import type { Timestamps } from './common.interface';
import type { PaginationParams } from './pagination.interface';
import type { Plan, PlanRef } from './plan.interface';
import type { TarjetaCompleta } from './tarjeta.interface';

/**
 * Rol tal como llega de la API. Admite roles que el frontend aún no conoce:
 * validar con `isRole()` antes de usarlo para permisos (lo desconocido se deniega).
 */
export type UserRole = Role | (string & {});

/** `UsuarioResponse` (sin contraseña: la API nunca la devuelve) */
export interface Usuario extends Timestamps {
	id: string;
	email: string;
	rol: UserRole;
	plan_id: string;
	/** Fin del plan vigente (ISO). Siempre tiene valor */
	plan_vence_at: string;
	/** false = dado de baja: no inicia sesión y su tarjeta queda despublicada */
	is_active: boolean;
	/** null = todavía no usó el enlace de verificación (no puede publicar) */
	email_verified_at: string | null;
}

/** `UsuarioRef` */
export interface UsuarioRef {
	id: string;
	email: string;
}

/** `UsuarioResponseDetail`: con el plan completo */
export interface UsuarioDetalle extends Usuario {
	plan: Plan;
}

/** Item de `GET /usuarios/` (`UsuarioResponseItemList`): el plan solo con id y nombre */
export interface UsuarioListItem extends Usuario {
	plan: PlanRef;
}

/** `GET /usuarios/me` (`UsuarioResponseMe`): el usuario, su plan y su tarjeta completa (null si no tiene) */
export interface UsuarioMe extends UsuarioDetalle {
	tarjeta: TarjetaCompleta | null;
}

/** `POST /usuarios/` (`UsuarioCreate`): solo roles inferiores al de quien crea. Empieza en free */
export interface UsuarioCreateRequest {
	email: string;
	password: string;
	rol?: AssignableUserRole;
}

/** `PATCH /usuarios/{id}` (`UsuarioUpdate`). Plan, estado y contraseña tienen sus propios caminos */
export interface UsuarioUpdateRequest {
	email?: string;
	rol?: AssignableUserRole;
}

/** `PATCH /usuarios/me` (`UsuarioUpdateMe`). Cambiar el email lo deja sin verificar */
export interface UsuarioUpdateMeRequest {
	email?: string;
}

/** Filtros de `GET /usuarios/` */
export interface UsuarioFiltros extends PaginationParams {
	rol?: Role;
	plan_id?: string;
	is_active?: boolean;
}
