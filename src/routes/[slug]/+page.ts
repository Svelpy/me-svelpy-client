import { error } from '@sveltejs/kit';
import { AppError, tarjetaService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

// Datos de prueba: el servidor no puede leer el localStorage del navegador, así que la tarjeta se
// arma en el cliente. Con la API real, quitar esta línea: Google y WhatsApp recibirán el HTML con
// el SEO y los datos estructurados ya puestos.
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
	try {
		return { tarjeta: await tarjetaService.obtenerPublica(params.slug) };
	} catch (causa) {
		if (causa instanceof AppError && causa.status === 404) {
			error(404, 'Esta tarjeta no existe o todavía no está publicada.');
		}
		throw causa;
	}
};
