import { get, writable } from 'svelte/store';
import type { Plan } from '#lib/interfaces/index.ts';
import { planService } from '#lib/services/index.ts';

/**
 * Catálogo de planes (`GET /planes/`, admin) cacheado durante la carga de la app. Lo usan los
 * filtros, el registro de pagos y los listados, que solo traen el id y el nombre del plan.
 */

const store = writable<Plan[] | null>(null);
let pendiente: Promise<Plan[]> | null = null;

export const planesStore = {
	subscribe: store.subscribe,

	/** El catálogo; lo pide una sola vez (o de nuevo con `forzar`, tras editar un plan) */
	cargar(forzar = false): Promise<Plan[]> {
		const actuales = get(store);
		if (actuales && !forzar) return Promise.resolve(actuales);
		pendiente ??= planService
			.listar({ per_page: 100 })
			.then(({ data }) => {
				store.set(data);
				return data;
			})
			.finally(() => {
				pendiente = null;
			});
		return pendiente;
	},

	/** Reemplaza un plan tras editarlo */
	reemplazar(plan: Plan): void {
		store.update((planes) => planes?.map((p) => (p.id === plan.id ? plan : p)) ?? [plan]);
	},

	reiniciar(): void {
		pendiente = null;
		store.set(null);
	}
};

/** El plan del catálogo con ese id */
export function planPorId(planes: Plan[] | null, id: string): Plan | undefined {
	return planes?.find((plan) => plan.id === id);
}
