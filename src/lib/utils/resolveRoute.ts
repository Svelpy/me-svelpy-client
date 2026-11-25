import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import type { StaticRouteId } from '#lib/config/routeAccess.config.ts';

/**
 * `resolve()` de SvelteKit tipa sus argumentos como una unión de tuplas (una por ruta), así que no
 * acepta una ruta cuyo tipo es la unión `StaticRouteId` (p. ej. `getHomeRoute(role)` o `item.route`).
 * Todas las `StaticRouteId` son rutas sin parámetros, por lo que resolverlas así es seguro.
 */
export function resolveStaticRoute(route: StaticRouteId): ReturnType<typeof resolve> {
	return resolve(...([route] as Parameters<typeof resolve>));
}

/**
 * Una ruta ya resuelta con su query (`/panel/pagos/nuevo?usuario=…`): sigue siendo una ruta de la
 * app. Los parámetros vacíos se omiten.
 */
export function rutaConQuery(
	ruta: ResolvedPathname,
	parametros: Record<string, string | null | undefined>
): ResolvedPathname {
	const query = new URLSearchParams();
	for (const [clave, valor] of Object.entries(parametros)) if (valor) query.set(clave, valor);
	const texto = query.toString();
	return (texto ? `${ruta}?${texto}` : ruta) as ResolvedPathname;
}
