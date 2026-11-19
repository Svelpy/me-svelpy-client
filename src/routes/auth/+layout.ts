import { redirect } from '@sveltejs/kit';
import { authStore } from '#lib/stores/index.ts';
import { getHomeRoute, isRole } from '#lib/utils/rbac.utils.ts';
import { resolveStaticRoute } from '#lib/utils/resolveRoute.ts';
import type { LayoutLoad } from './$types';

// La sesión vive en localStorage: estas páginas se arman en el navegador
export const ssr = false;

/** Con una sesión válida no tiene sentido ver el login: se va directo al inicio del rol */
export const load: LayoutLoad = async () => {
	const sesion = await authStore.ensureSession();
	const rol = sesion?.user.rol;
	if (isRole(rol)) redirect(307, resolveStaticRoute(getHomeRoute(rol)));
};
