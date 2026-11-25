import { redirect } from '@sveltejs/kit';
import { authStore } from '#lib/stores/index.ts';
import { getHomeRoute, isRole } from '#lib/utils/rbac.utils.ts';
import { resolveStaticRoute } from '#lib/utils/resolveRoute.ts';
import type { LayoutLoad } from './$types';

// La sesión vive en localStorage: estas páginas se arman en el navegador
export const ssr = false;

/** Las que no tienen sentido con sesión: quien ya entró va directo al inicio de su rol */
const SOLO_SIN_SESION = new Set(['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password']);

/**
 * Verificar el email y restablecer la contraseña se abren desde un correo, muchas veces con la
 * sesión abierta en el mismo navegador: esas páginas no redirigen.
 */
export const load: LayoutLoad = async ({ route }) => {
	if (!route.id || !SOLO_SIN_SESION.has(route.id)) return;
	const sesion = await authStore.ensureSession();
	const rol = sesion?.user.rol;
	if (isRole(rol)) redirect(307, resolveStaticRoute(getHomeRoute(rol)));
};
