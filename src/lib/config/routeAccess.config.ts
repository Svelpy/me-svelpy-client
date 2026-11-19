import type { RouteId, RouteParams } from '$app/types';
import { Role } from './permissions.config';

/** Rutas sin parámetros (`[id]`): se pueden resolver a una URL sin datos extra */
export type StaticRouteId = {
	[K in RouteId]: RouteParams<K> extends Record<string, never> ? K : never;
}[RouteId];

/**
 * Páginas que puede abrir cada rol. Es independiente de los permisos por módulo:
 * editar contactos (módulo CONTACTO) no implica abrir el directorio de tarjetas.
 * La tarjeta pública (`/[slug]`) no pasa por aquí: la ve cualquiera.
 */
export interface RoleAccess {
	/** Página de inicio del rol: destino tras el login y al entrar a una ruta no permitida */
	home: StaticRouteId;
	/** Cada ruta habilita también todas sus subrutas ('/panel' cubre '/panel/tarjetas/[id]') */
	routes: readonly RouteId[];
	/**
	 * Solo esa página, sin sus subrutas. Para abrir una página raíz sin habilitar todo lo que
	 * cuelga de ella.
	 */
	exactRoutes?: readonly RouteId[];
	/**
	 * Se deniegan aunque `routes` las cubra (también sus subrutas). Para quitar una página puntual
	 * a un rol que abre todo un área (p. ej. "Mi tarjeta" al SUPERADMIN, que no tiene tarjeta propia).
	 */
	excludedRoutes?: readonly RouteId[];
}

/** `Record<Role, ...>` obliga a configurar aquí cualquier rol nuevo. Lo no listado se deniega. */
export const ROLE_ACCESS: Record<Role, RoleAccess> = {
	[Role.SUPERADMIN]: {
		home: '/panel',
		routes: ['/panel'],
		excludedRoutes: ['/panel/mi-tarjeta']
	},
	// El owner solo gestiona su tarjeta: su inicio es el editor
	[Role.OWNER]: {
		home: '/panel/mi-tarjeta',
		routes: ['/panel/mi-tarjeta', '/panel/cuenta']
	}
};
