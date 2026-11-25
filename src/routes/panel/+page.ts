import { cargarResumen } from '#lib/components/features/resumen/resumen.ts';
import type { PageLoad } from './$types';

// La promesa se entrega sin esperar: la página muestra el esqueleto mientras llega
export const load: PageLoad = ({ depends }) => {
	depends('app:resumen');
	return { resumen: cargarResumen() };
};
