import { tarjetaService } from '#lib/services/index.ts';
import type { TarjetaEstado, TarjetaFiltros } from '#lib/interfaces/index.ts';
import type { PageLoad } from './$types';

const ESTADOS: TarjetaEstado[] = ['publicada', 'borrador'];

/** Los filtros viven en la URL: se pueden compartir y sobreviven a recargar */
export const load: PageLoad = ({ url, depends }) => {
	depends('app:tarjetas');
	const estado = url.searchParams.get('estado') as TarjetaEstado | null;
	const filtros: TarjetaFiltros = {
		q: url.searchParams.get('q') || undefined,
		estado: estado && ESTADOS.includes(estado) ? estado : undefined,
		page: Number(url.searchParams.get('page')) || 1,
		per_page: 12
	};
	return {
		filtros,
		vista: url.searchParams.get('vista') === 'lista' ? ('lista' as const) : ('mosaico' as const),
		listado: tarjetaService.listar(filtros)
	};
};
