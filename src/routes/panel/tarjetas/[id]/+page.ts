import { tarjetaService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => ({
	tarjeta: tarjetaService.obtener(params.id)
});
