import { describe, expect, it } from 'vitest';
import { PANEL_NAVIGATION } from '#lib/config/navigation.config.ts';
import { Action, Module, Role } from '#lib/config/permissions.config.ts';
import { filterNavigation } from './navigation';
import {
	can,
	canAccessRoute,
	canCambiarSlug,
	getAssignableUserRoles,
	getHomeRoute,
	isRole,
	isSafeRedirect,
	puedeGestionarCuenta
} from './rbac.utils';

const RUTAS_ADMIN = [
	'/panel',
	'/panel/tarjetas',
	'/panel/tarjetas/nueva',
	'/panel/tarjetas/[id]',
	'/panel/usuarios',
	'/panel/usuarios/nuevo',
	'/panel/usuarios/[id]',
	'/panel/pagos',
	'/panel/pagos/nuevo',
	'/panel/planes',
	'/panel/cuenta'
];

describe('isRole', () => {
	it('acepta solo los roles de la API (en minúsculas)', () => {
		expect(isRole('superadmin')).toBe(true);
		expect(isRole('admin')).toBe(true);
		expect(isRole('user')).toBe(true);
		expect(isRole('SUPERADMIN')).toBe(false);
		expect(isRole('OWNER')).toBe(false);
		expect(isRole(undefined)).toBe(false);
	});
});

describe('canAccessRoute', () => {
	it.each(Object.values(Role))('la página de inicio de %s es accesible para ese rol', (role) => {
		expect(canAccessRoute(role, getHomeRoute(role))).toBe(true);
	});

	it.each([Role.SUPERADMIN, Role.ADMIN])(
		'%s abre todo el panel salvo "Mi tarjeta" (no tiene tarjeta propia)',
		(role) => {
			for (const ruta of RUTAS_ADMIN) expect(canAccessRoute(role, ruta)).toBe(true);
			expect(canAccessRoute(role, '/panel/mi-tarjeta')).toBe(false);
		}
	);

	it('el user solo abre su tarjeta y su cuenta', () => {
		expect(canAccessRoute(Role.USER, '/panel/mi-tarjeta')).toBe(true);
		expect(canAccessRoute(Role.USER, '/panel/cuenta')).toBe(true);
		for (const ruta of RUTAS_ADMIN.filter((r) => r !== '/panel/cuenta')) {
			expect(canAccessRoute(Role.USER, ruta)).toBe(false);
		}
	});

	it('compara por segmentos, no por prefijo de texto', () => {
		expect(canAccessRoute(Role.USER, '/panel/mi-tarjeta-x')).toBe(false);
		expect(canAccessRoute(Role.SUPERADMIN, '/panelx')).toBe(false);
	});

	it('ignora los grupos de rutas', () => {
		expect(canAccessRoute(Role.USER, '/(app)/panel/mi-tarjeta')).toBe(true);
		expect(canAccessRoute(Role.ADMIN, '/(app)/panel/mi-tarjeta')).toBe(false);
	});

	it('deniega sin rol o sin ruta', () => {
		expect(canAccessRoute(null, '/panel')).toBe(false);
		expect(canAccessRoute(Role.SUPERADMIN, null)).toBe(false);
	});
});

describe('can', () => {
	it('el superadmin tiene todas las acciones en todos los módulos', () => {
		for (const module of Object.values(Module)) {
			for (const action of Object.values(Action))
				expect(can(Role.SUPERADMIN, module, action)).toBe(true);
		}
	});

	it('el admin hace todo menos eliminar cuentas y tarjetas', () => {
		expect(can(Role.ADMIN, Module.USUARIO, Action.DELETE)).toBe(false);
		expect(can(Role.ADMIN, Module.TARJETA, Action.DELETE)).toBe(false);
		for (const action of [Action.CREATE, Action.READ, Action.UPDATE]) {
			expect(can(Role.ADMIN, Module.USUARIO, action)).toBe(true);
			expect(can(Role.ADMIN, Module.TARJETA, action)).toBe(true);
		}
		// Quitar un contacto es editar la tarjeta: eso sí puede
		expect(can(Role.ADMIN, Module.CONTACTO, Action.DELETE)).toBe(true);
		expect(can(Role.ADMIN, Module.PAGO, Action.CREATE)).toBe(true);
		expect(can(Role.ADMIN, Module.PLAN, Action.UPDATE)).toBe(true);
	});

	it('el user no gestiona cuentas, pagos ni planes, ni elimina su tarjeta', () => {
		for (const module of [Module.USUARIO, Module.PAGO, Module.PLAN, Module.MANTENIMIENTO]) {
			for (const action of Object.values(Action))
				expect(can(Role.USER, module, action)).toBe(false);
		}
		expect(can(Role.USER, Module.TARJETA, Action.UPDATE)).toBe(true);
		expect(can(Role.USER, Module.TARJETA, Action.DELETE)).toBe(false);
	});

	it('el user solo lee y edita el tema, el SEO y las secciones', () => {
		for (const module of [Module.TEMA, Module.SEO, Module.SECCION]) {
			expect(can(Role.USER, module, Action.UPDATE)).toBe(true);
			expect(can(Role.USER, module, Action.CREATE)).toBe(false);
			expect(can(Role.USER, module, Action.DELETE)).toBe(false);
		}
	});

	it('el user gestiona todo el contenido de su tarjeta', () => {
		for (const module of [
			Module.CONTACTO,
			Module.UBICACION,
			Module.RED_SOCIAL,
			Module.VITRINA,
			Module.EDUCACION,
			Module.CERTIFICACION,
			Module.FAQ
		]) {
			for (const action of Object.values(Action)) expect(can(Role.USER, module, action)).toBe(true);
		}
	});

	it('sin rol no hay permisos', () => {
		expect(can(null, Module.TARJETA, Action.READ)).toBe(false);
	});
});

describe('jerarquía', () => {
	it('cada rol asigna solo roles de rango menor', () => {
		expect(getAssignableUserRoles(Role.SUPERADMIN)).toEqual([Role.USER, Role.ADMIN]);
		expect(getAssignableUserRoles(Role.ADMIN)).toEqual([Role.USER]);
		expect(getAssignableUserRoles(Role.USER)).toEqual([]);
		expect(getAssignableUserRoles(null)).toEqual([]);
	});

	it('cada rol gestiona solo cuentas de rango menor', () => {
		expect(puedeGestionarCuenta(Role.SUPERADMIN, Role.ADMIN)).toBe(true);
		expect(puedeGestionarCuenta(Role.SUPERADMIN, Role.SUPERADMIN)).toBe(false);
		expect(puedeGestionarCuenta(Role.ADMIN, Role.USER)).toBe(true);
		expect(puedeGestionarCuenta(Role.ADMIN, Role.ADMIN)).toBe(false);
		expect(puedeGestionarCuenta(Role.ADMIN, Role.SUPERADMIN)).toBe(false);
		expect(puedeGestionarCuenta(Role.USER, Role.USER)).toBe(false);
		expect(puedeGestionarCuenta(Role.SUPERADMIN, 'desconocido')).toBe(false);
	});

	it('solo los admins cambian la dirección de una tarjeta', () => {
		expect(canCambiarSlug(Role.SUPERADMIN)).toBe(true);
		expect(canCambiarSlug(Role.ADMIN)).toBe(true);
		expect(canCambiarSlug(Role.USER)).toBe(false);
		expect(canCambiarSlug(null)).toBe(false);
	});
});

describe('filterNavigation', () => {
	const ids = (role: Role | null) =>
		filterNavigation(PANEL_NAVIGATION, role).flatMap((s) => s.items.map((i) => i.id));

	it('el user ve solo su tarjeta y su cuenta', () => {
		expect(ids(Role.USER)).toEqual(['mi-tarjeta', 'cuenta']);
	});

	it.each([Role.SUPERADMIN, Role.ADMIN])('%s ve la administración y su cuenta', (role) => {
		expect(ids(role)).toEqual(['inicio', 'tarjetas', 'usuarios', 'pagos', 'planes', 'cuenta']);
	});

	it('sin rol no hay menú', () => {
		expect(filterNavigation(PANEL_NAVIGATION, null)).toEqual([]);
	});
});

describe('isSafeRedirect', () => {
	it('solo acepta rutas internas', () => {
		expect(isSafeRedirect('/panel/tarjetas?page=2')).toBe(true);
		expect(isSafeRedirect('//otro-sitio.com')).toBe(false);
		expect(isSafeRedirect('/\\otro-sitio.com')).toBe(false);
		expect(isSafeRedirect('https://otro-sitio.com')).toBe(false);
		expect(isSafeRedirect(null)).toBe(false);
	});
});
