import { error } from '@sveltejs/kit';
import { AppError, tarjetaService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

// Se renderiza en el servidor: Google, WhatsApp y las IAs reciben el HTML con el SEO y los datos
// estructurados ya puestos. Con el `fetch` del load, el navegador no repite la petición al hidratar.
export const load: PageLoad = async ({ params, fetch }) => {
	try {
		return { tarjeta: await tarjetaService.obtenerPublica(params.slug, { fetch }) };
	} catch (causa) {
		if (causa instanceof AppError && causa.status === 404) {
			error(404, 'Esta tarjeta no existe o todavía no está publicada.');
		}
		throw causa;
	}
};
