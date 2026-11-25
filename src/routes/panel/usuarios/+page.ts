import type { UsuarioFiltros } from '#lib/interfaces/index.ts';
import { usuarioService } from '#lib/services/index.ts';
import { planesStore } from '#lib/stores/index.ts';
import { isRole } from '#lib/utils/rbac.utils.ts';
import type { PageLoad } from './$types';

/** `?estado=` en palabras → `is_active` de la API */
const ESTADOS = { activa: true, baja: false } as const;
type Estado = keyof typeof ESTADOS;
const esEstado = (valor: string | null): valor is Estado => valor === 'activa' || valor === 'baja';

/** Los filtros viven en la URL (rol, plan y estado: los que acepta `GET /usuarios/`) */
export const load: PageLoad = ({ url, depends }) => {
	depends('app:usuarios');
	const rol = url.searchParams.get('rol');
	const estado = url.searchParams.get('estado');
	const filtros: UsuarioFiltros = {
		rol: isRole(rol) ? rol : undefined,
		plan_id: url.searchParams.get('plan') || undefined,
		is_active: esEstado(estado) ? ESTADOS[estado] : undefined,
		page: Number(url.searchParams.get('page')) || 1,
		per_page: 20
	};
	return {
		filtros,
		estado: esEstado(estado) ? estado : null,
		listado: usuarioService.listar(filtros),
		// El listado trae el plan solo con su nombre: el catálogo da el código (Free, Pro…)
		planes: planesStore.cargar().catch(() => [])
	};
};
