/**
 * Permisos por rol sobre cada módulo: quién puede hacer qué, sobre qué módulo.
 * Espejo de `has_permission` del backend; si cambia allá, cambia aquí.
 *
 * Solo decide qué se muestra en la UI (botones, opciones). La seguridad real la aplica el backend
 * en cada endpoint, incluida la pertenencia: un OWNER solo actúa sobre SU tarjeta.
 * El acceso a páginas se configura aparte en `routeAccess.config.ts`.
 */

export const Role = {
	SUPERADMIN: 'SUPERADMIN',
	OWNER: 'OWNER'
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/** Un módulo por modelo (o grupo de modelos que se editan juntos) */
export const Module = {
	USUARIO: 'USUARIO',
	TARJETA: 'TARJETA',
	TEMA: 'TEMA',
	SEO: 'SEO',
	SECCION: 'SECCION',
	CONTACTO: 'CONTACTO',
	/** Ubicaciones y sus horarios */
	UBICACION: 'UBICACION',
	RED_SOCIAL: 'RED_SOCIAL',
	/** Vitrina, categorías, ítems e imágenes */
	VITRINA: 'VITRINA',
	EDUCACION: 'EDUCACION',
	CERTIFICACION: 'CERTIFICACION',
	FAQ: 'FAQ'
} as const;
export type Module = (typeof Module)[keyof typeof Module];

export const Action = {
	CREATE: 'CREATE',
	READ: 'READ',
	UPDATE: 'UPDATE',
	DELETE: 'DELETE'
} as const;
export type Action = (typeof Action)[keyof typeof Action];

/** Roles que la API acepta al crear o editar un usuario */
export const ASSIGNABLE_USER_ROLES = [Role.OWNER, Role.SUPERADMIN] as const;
export type AssignableUserRole = (typeof ASSIGNABLE_USER_ROLES)[number];

/**
 * Roles que pueden cambiar el slug de una tarjeta. El owner no: sus QR impresos y los enlaces
 * que ya compartió dejarían de funcionar, así que el cambio pasa por soporte.
 */
export const CAMBIAR_SLUG_ROLES: readonly Role[] = [Role.SUPERADMIN];

type ModulePermissions = Partial<Record<Module, readonly Action[]>>;

const ALL_ACTIONS: readonly Action[] = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE];
const LEER_Y_EDITAR: readonly Action[] = [Action.READ, Action.UPDATE];

/** Todas las acciones en todos los módulos */
function fullAccess(): ModulePermissions {
	const permissions: ModulePermissions = {};
	for (const module of Object.values(Module)) permissions[module] = ALL_ACTIONS;
	return permissions;
}

/**
 * Un módulo ausente en un rol = sin acceso a ese módulo (ni siquiera lectura).
 * `Record<Role, ...>` obliga a configurar aquí cualquier rol nuevo.
 */
export const ROLE_PERMISSIONS: Record<Role, ModulePermissions> = {
	[Role.SUPERADMIN]: fullAccess(),
	[Role.OWNER]: {
		// Crea su tarjeta si aún no tiene; no la elimina (eso lo hace soporte)
		[Module.TARJETA]: [Action.CREATE, Action.READ, Action.UPDATE],
		// Tema, SEO y secciones nacen con la tarjeta: solo se leen y editan
		[Module.TEMA]: LEER_Y_EDITAR,
		[Module.SEO]: LEER_Y_EDITAR,
		[Module.SECCION]: LEER_Y_EDITAR,
		[Module.CONTACTO]: ALL_ACTIONS,
		[Module.UBICACION]: ALL_ACTIONS,
		[Module.RED_SOCIAL]: ALL_ACTIONS,
		[Module.VITRINA]: ALL_ACTIONS,
		[Module.EDUCACION]: ALL_ACTIONS,
		[Module.CERTIFICACION]: ALL_ACTIONS,
		[Module.FAQ]: ALL_ACTIONS
	}
};
