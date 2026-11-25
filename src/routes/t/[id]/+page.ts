import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { AppError, tarjetaService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

/**
 * Lo que abre el código QR: `/t/{id}`. El QR lleva el id (no el enlace) para que una tarjeta
 * impresa siga funcionando aunque su enlace cambie; aquí se redirige al enlace actual.
 */
export const load: PageLoad = async ({ params, fetch }) => {
	let slug: string;
	try {
		({ slug } = await tarjetaService.obtenerPublicaPorId(params.id, { fetch }));
	} catch (causa) {
		// 404: no existe, no está publicada o su plan venció. 422: el id no tiene formato válido
		if (causa instanceof AppError && (causa.status === 404 || causa.status === 422)) {
			error(404, 'Esta tarjeta no existe o todavía no está publicada.');
		}
		throw causa;
	}
	// 307: el destino puede cambiar, no se guarda como permanente
	redirect(307, resolve('/[slug]', { slug }));
};
