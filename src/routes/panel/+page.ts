import { resumenService } from '#lib/services/index.ts';
import type { PageLoad } from './$types';

// La promesa se entrega sin esperar: la página muestra el esqueleto mientras llega
export const load: PageLoad = ({ depends }) => {
	depends('app:resumen');
	return { resumen: resumenService.admin() };
};
