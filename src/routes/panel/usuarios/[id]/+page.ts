import { pagoService, tarjetaService, usuarioService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

/** La cuenta, su tarjeta (una por cuenta) y sus pagos, en paralelo */
async function cargar(id: string) {
	const [cuenta, tarjetas, pagos] = await Promise.all([
		usuarioService.obtener(id),
		tarjetaService.listar({ user_id: id, per_page: 1 }),
		pagoService.listar({ user_id: id, per_page: 50 })
	]);
	return { cuenta, tarjeta: tarjetas.data[0] ?? null, pagos };
}

export const load: PageLoad = ({ params, depends }) => {
	depends('app:cuenta');
	return { detalle: cargar(params.id) };
};
