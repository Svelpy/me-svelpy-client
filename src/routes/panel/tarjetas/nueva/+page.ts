import { Role } from '#lib/config/permissions.config.ts';
import { usuarioService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

/** Cuentas de propietario activas que todavía no tienen tarjeta */
export const load: PageLoad = ({ url }) => ({
	cuentaInicial: url.searchParams.get('cuenta') ?? '',
	cuentas: usuarioService
		.listar({ rol: Role.OWNER, estado: 'activo', per_page: 100 })
		.then((respuesta) => respuesta.data.filter((cuenta) => cuenta.tarjeta === null))
});
