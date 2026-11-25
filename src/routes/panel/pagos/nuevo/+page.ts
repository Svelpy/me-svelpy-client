import { Role } from '#lib/config/permissions.config.ts';
import { usuarioService } from '#lib/services/index.ts';
import { planesStore } from '#lib/stores/index.ts';
import type { PageLoad } from './$types';

/**
 * Con `?usuario=` (desde una cuenta o el editor) la cuenta ya viene elegida; si no, se elige entre
 * las cuentas user.
 */
export const load: PageLoad = ({ url }) => {
	const usuarioId = url.searchParams.get('usuario');
	return {
		cuenta: usuarioId ? usuarioService.obtener(usuarioId) : null,
		cuentas: usuarioId
			? Promise.resolve([])
			: usuarioService.listar({ rol: Role.USER, per_page: 100 }).then(({ data }) => data),
		planes: planesStore.cargar()
	};
};
