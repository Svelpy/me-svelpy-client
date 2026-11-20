import { isPlan } from '#lib/config/planes.config.ts';
import { isRole } from '#lib/utils/rbac.utils.ts';
import { usuarioService } from '#lib/services/index.ts';
import type { UsuarioEstado, UsuarioFiltros } from '#lib/interfaces/index.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url, depends }) => {
	depends('app:usuarios');
	const rol = url.searchParams.get('rol');
	const estado = url.searchParams.get('estado');
	const plan = url.searchParams.get('plan');
	const filtros: UsuarioFiltros = {
		q: url.searchParams.get('q') || undefined,
		rol: isRole(rol) ? rol : undefined,
		estado: estado === 'activo' || estado === 'inactivo' ? (estado as UsuarioEstado) : undefined,
		plan: isPlan(plan) ? plan : undefined,
		page: Number(url.searchParams.get('page')) || 1,
		per_page: 20
	};
	return { filtros, listado: usuarioService.listar(filtros) };
};
