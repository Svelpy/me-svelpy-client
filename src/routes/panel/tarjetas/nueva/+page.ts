import { Role } from '#lib/config/permissions.config.ts';
import { usuarioService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

/**
 * Cuentas user activas. El listado de la API no dice cuáles ya tienen tarjeta: el formulario lo
 * revisa al elegir una.
 */
export const load: PageLoad = ({ url }) => ({
	cuentaInicial: url.searchParams.get('cuenta') ?? '',
	cuentas: usuarioService
		.listar({ rol: Role.USER, is_active: true, per_page: 100 })
		.then((respuesta) => respuesta.data)
});
