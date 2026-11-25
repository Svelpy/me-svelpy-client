import type { PagoFiltros } from '#lib/interfaces/index.ts';
import { pagoService } from '#lib/services/index.ts';
import { planesStore } from '#lib/stores/index.ts';
import type { PageLoad } from './$types';

/** Filtros en la URL: plan y cuenta (los que acepta `GET /pagos/`) */
export const load: PageLoad = ({ url, depends }) => {
	depends('app:pagos');
	const filtros: PagoFiltros = {
		plan_id: url.searchParams.get('plan') || undefined,
		user_id: url.searchParams.get('cuenta') || undefined,
		page: Number(url.searchParams.get('page')) || 1,
		per_page: 20
	};
	return {
		filtros,
		listado: pagoService.listar(filtros),
		planes: planesStore.cargar().catch(() => [])
	};
};
