import { guardRoute } from '#lib/utils/routeGuard.ts';
import type { LayoutLoad } from './$types';

// La sesión vive en localStorage: el panel se arma en el navegador
export const ssr = false;

export const load: LayoutLoad = async (event) => {
	const role = await guardRoute(event);
	return { role };
};
