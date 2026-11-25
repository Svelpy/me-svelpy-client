import { tarjetaService } from '#lib/services/index.ts';
import type { TarjetaFiltros } from '#lib/interfaces/index.ts';
import type { PageLoad } from './$types';

/** `?estado=` en palabras (se lee mejor al compartir la URL) → `is_public` de la API */
const ESTADOS = { publicada: true, borrador: false } as const;
type Estado = keyof typeof ESTADOS;

const esEstado = (valor: string | null): valor is Estado =>
	valor === 'publicada' || valor === 'borrador';

/** Los filtros viven en la URL: se pueden compartir y sobreviven a recargar */
export const load: PageLoad = ({ url, depends }) => {
	depends('app:tarjetas');
	const parametro = url.searchParams.get('estado');
	const estado = esEstado(parametro) ? parametro : null;
	const filtros: TarjetaFiltros = {
		is_public: estado ? ESTADOS[estado] : undefined,
		user_id: url.searchParams.get('cuenta') || undefined,
		page: Number(url.searchParams.get('page')) || 1,
		per_page: 12
	};
	return {
		filtros,
		estado,
		vista: url.searchParams.get('vista') === 'lista' ? ('lista' as const) : ('mosaico' as const),
		listado: tarjetaService.listar(filtros)
	};
};
