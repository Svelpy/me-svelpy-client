import { resolveStaticRoute } from '#lib/utils/resolveRoute.ts';
import { HomeDotIcon, IdIcon, UserIcon, UsersIcon } from '#lib/icons/outline/index.ts';
import type { NavItem, NavSection } from '#lib/interfaces/index.ts';
import { Role } from './permissions.config';

/** El href se resuelve desde la ruta: una sola fuente para el link y para el control de acceso */
function navItem(item: Omit<NavItem, 'href'>): NavItem {
	return { ...item, href: resolveStaticRoute(item.route) };
}

/**
 * Menú del panel (/panel), única fuente de verdad para la navegación y el título de cada página.
 * Cada usuario ve solo los items que su rol puede abrir según `ROLE_ACCESS` (filterNavigation).
 */
export const PANEL_NAVIGATION: NavSection[] = [
	{
		id: 'general',
		label: 'General',
		items: [
			navItem({ id: 'inicio', label: 'Inicio', route: '/panel', icon: HomeDotIcon, exact: true }),
			navItem({ id: 'tarjetas', label: 'Tarjetas', route: '/panel/tarjetas', icon: IdIcon }),
			navItem({ id: 'usuarios', label: 'Usuarios', route: '/panel/usuarios', icon: UsersIcon })
		]
	},
	{
		id: 'mi-tarjeta',
		label: 'Mi tarjeta',
		items: [
			navItem({ id: 'mi-tarjeta', label: 'Mi tarjeta', route: '/panel/mi-tarjeta', icon: IdIcon })
		]
	},
	{
		id: 'cuenta',
		label: 'Cuenta',
		items: [navItem({ id: 'cuenta', label: 'Mi cuenta', route: '/panel/cuenta', icon: UserIcon })]
	}
];

/**
 * Carcasa del panel por rol. El superadmin recorre varias áreas: menú lateral. El owner gestiona
 * una sola cosa (su tarjeta): barra superior, para que el editor y su vista previa ocupen el ancho.
 * `Record<Role, ...>` obliga a decidirlo para cualquier rol nuevo.
 */
export const PANEL_DISENO: Record<Role, 'lateral' | 'superior'> = {
	[Role.SUPERADMIN]: 'lateral',
	[Role.OWNER]: 'superior'
};
