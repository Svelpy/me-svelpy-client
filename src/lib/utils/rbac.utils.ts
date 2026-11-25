import {
	ASSIGNABLE_USER_ROLES,
	CAMBIAR_SLUG_ROLES,
	RANGO_ROL,
	ROLE_PERMISSIONS,
	Role,
	type Action,
	type AssignableUserRole,
	type Module
} from '#lib/config/permissions.config.ts';
import type { RouteId } from '$app/types';
import { ROLE_ACCESS, type StaticRouteId } from '#lib/config/routeAccess.config.ts';

const ROLES = new Set<string>(Object.values(Role));

/** true si el valor (p. ej. el rol que devuelve la API) es un rol conocido por el frontend */
export function isRole(value: unknown): value is Role {
	return typeof value === 'string' && ROLES.has(value);
}

/** true si el rol tiene la acción habilitada en ese módulo */
export function can(role: Role | null, module: Module, action: Action): boolean {
	if (!role) return false;
	return ROLE_PERMISSIONS[role]?.[module]?.includes(action) ?? false;
}

/** true si el rol puede cambiar el slug (la dirección pública) de una tarjeta */
export function canCambiarSlug(role: Role | null): boolean {
	return !!role && CAMBIAR_SLUG_ROLES.includes(role);
}

/** Roles que el rol puede asignar al crear o editar un usuario: solo los de rango menor */
export function getAssignableUserRoles(role: Role | null): AssignableUserRole[] {
	if (!role) return [];
	return ASSIGNABLE_USER_ROLES.filter((asignable) => RANGO_ROL[asignable] < RANGO_ROL[role]);
}

/**
 * true si `actor` puede gestionar (editar, dar de baja, eliminar…) una cuenta con `rolObjetivo`:
 * solo las de rango menor, como exige el backend. Un rol desconocido no se gestiona.
 */
export function puedeGestionarCuenta(actor: Role | null, rolObjetivo: string): boolean {
	if (!actor || !isRole(rolObjetivo)) return false;
	return RANGO_ROL[actor] > RANGO_ROL[rolObjetivo];
}

// Los grupos de rutas `(grupo)` no forman parte de la URL: '/(admin)/panel' equivale a '/panel'
function stripRouteGroups(routeId: string): string {
	return routeId.replace(/\/\([^)]+\)/g, '') || '/';
}

/** true si el rol puede abrir la ruta (route id de SvelteKit, p. ej. '/panel/tarjetas/[id]') */
export function canAccessRoute(role: Role | null, routeId: string | null): boolean {
	if (!role || !routeId) return false;
	const access = ROLE_ACCESS[role];
	if (!access) return false;

	const id = stripRouteGroups(routeId);
	// Por segmentos: '/panel/tarjetas' cubre '/panel/tarjetas/[id]' pero no '/panel/tarjetas-x'
	const covers = (route: string) => id === route || id.startsWith(`${route}/`);

	if (access.excludedRoutes?.some(covers)) return false;
	if (access.exactRoutes?.includes(id as RouteId)) return true;
	return access.routes.some(covers);
}

/** Página de inicio del rol */
export function getHomeRoute(role: Role): StaticRouteId {
	return ROLE_ACCESS[role].home;
}

/** Solo rutas internas del sitio: evita redirecciones abiertas con `?redirectTo=//otro-sitio.com` */
export function isSafeRedirect(path: string | null): path is string {
	return !!path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');
}
