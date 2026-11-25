import { tarjetaService, usuarioService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

/** La tarjeta completa (con theme, SEO y vitrina) y su dueño (plan, verificación, estado) */
async function cargar(id: string) {
	const tarjeta = await tarjetaService.obtenerCompleta(id);
	const cuenta = await usuarioService.obtener(tarjeta.user_id);
	return { tarjeta, cuenta };
}

export const load: PageLoad = ({ params }) => ({ editor: cargar(params.id) });
