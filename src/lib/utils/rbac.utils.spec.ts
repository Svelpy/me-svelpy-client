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
	isSafeRedirect
} from './rbac.utils';

const RUTAS_SUPERADMIN = [
	'/panel',
	'/panel/tarjetas',
	'/panel/tarjetas/nueva',
	'/panel/tarjetas/[id]',
	'/panel/usuarios',
	'/panel/usuarios/nuevo',
	'/panel/cuenta'
];

describe('isRole', () => {
	it('acepta solo los roles de ME', () => {
		expect(isRole('SUPERADMIN')).toBe(true);
		expect(isRole('OWNER')).toBe(true);
		expect(isRole('CAJERO')).toBe(false);
		expect(isRole(undefined)).toBe(false);
	});
});

describe('canAccessRoute', () => {
	it.each(Object.values(Role))('la página de inicio de %s es accesible para ese rol', (role) => {
		expect(canAccessRoute(role, getHomeRoute(role))).toBe(true);
	});

	it('SUPERADMIN abre todo el panel salvo "Mi tarjeta" (no tiene tarjeta propia)', () => {
		for (const ruta of RUTAS_SUPERADMIN) expect(canAccessRoute(Role.SUPERADMIN, ruta)).toBe(true);
		expect(canAccessRoute(Role.SUPERADMIN, '/panel/mi-tarjeta')).toBe(false);
	});

	it('OWNER solo abre su tarjeta y su cuenta', () => {
		expect(canAccessRoute(Role.OWNER, '/panel/mi-tarjeta')).toBe(true);
		expect(canAccessRoute(Role.OWNER, '/panel/cuenta')).toBe(true);
		for (const ruta of ['/panel', '/panel/tarjetas', '/panel/tarjetas/[id]', '/panel/usuarios']) {
			expect(canAccessRoute(Role.OWNER, ruta)).toBe(false);
		}
	});

	it('compara por segmentos, no por prefijo de texto', () => {
		expect(canAccessRoute(Role.OWNER, '/panel/mi-tarjeta-x')).toBe(false);
		expect(canAccessRoute(Role.SUPERADMIN, '/panelx')).toBe(false);
	});

	it('ignora los grupos de rutas', () => {
		expect(canAccessRoute(Role.OWNER, '/(app)/panel/mi-tarjeta')).toBe(true);
		expect(canAccessRoute(Role.SUPERADMIN, '/(app)/panel/mi-tarjeta')).toBe(false);
	});

	it('deniega sin rol o sin ruta', () => {
		expect(canAccessRoute(null, '/panel')).toBe(false);
		expect(canAccessRoute(Role.SUPERADMIN, null)).toBe(false);
	});
});

describe('can', () => {
	it('SUPERADMIN tiene todas las acciones en todos los módulos', () => {
		for (const module of Object.values(Module)) {
			for (const action of Object.values(Action))
				expect(can(Role.SUPERADMIN, module, action)).toBe(true);
		}
	});

	it('OWNER no gestiona cuentas ni elimina su tarjeta', () => {
		for (const action of Object.values(Action))
			expect(can(Role.OWNER, Module.USUARIO, action)).toBe(false);
		expect(can(Role.OWNER, Module.TARJETA, Action.UPDATE)).toBe(true);
		expect(can(Role.OWNER, Module.TARJETA, Action.DELETE)).toBe(false);
	});

	it('OWNER solo lee y edita el tema, el SEO y las secciones', () => {
		for (const module of [Module.TEMA, Module.SEO, Module.SECCION]) {
			expect(can(Role.OWNER, module, Action.UPDATE)).toBe(true);
			expect(can(Role.OWNER, module, Action.CREATE)).toBe(false);
			expect(can(Role.OWNER, module, Action.DELETE)).toBe(false);
		}
	});

	it('OWNER gestiona todo el contenido de su tarjeta', () => {
		for (const module of [
			Module.CONTACTO,
			Module.UBICACION,
			Module.RED_SOCIAL,
			Module.VITRINA,
			Module.EDUCACION,
			Module.CERTIFICACION,
			Module.FAQ
		]) {
			for (const action of Object.values(Action))
				expect(can(Role.OWNER, module, action)).toBe(true);
		}
	});

	it('sin rol no hay permisos', () => {
		expect(can(null, Module.TARJETA, Action.READ)).toBe(false);
	});
});

describe('reglas especiales', () => {
	it('solo el superadmin cambia la dirección de una tarjeta', () => {
		expect(canCambiarSlug(Role.SUPERADMIN)).toBe(true);
		expect(canCambiarSlug(Role.OWNER)).toBe(false);
		expect(canCambiarSlug(null)).toBe(false);
	});

	it('solo el superadmin asigna roles', () => {
		expect(getAssignableUserRoles(Role.SUPERADMIN)).toEqual([Role.OWNER, Role.SUPERADMIN]);
		expect(getAssignableUserRoles(Role.OWNER)).toEqual([]);
	});
});

describe('filterNavigation', () => {
	it('el owner ve solo su tarjeta y su cuenta', () => {
		const items = filterNavigation(PANEL_NAVIGATION, Role.OWNER).flatMap((s) =>
			s.items.map((i) => i.id)
		);
		expect(items).toEqual(['mi-tarjeta', 'cuenta']);
	});

	it('el superadmin ve el inicio, tarjetas, usuarios y su cuenta', () => {
		const items = filterNavigation(PANEL_NAVIGATION, Role.SUPERADMIN).flatMap((s) =>
			s.items.map((i) => i.id)
		);
		expect(items).toEqual(['inicio', 'tarjetas', 'usuarios', 'cuenta']);
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
