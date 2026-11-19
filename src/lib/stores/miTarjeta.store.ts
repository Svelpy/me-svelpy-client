import { get, writable } from 'svelte/store';
import type { TarjetaCompleta } from '#lib/interfaces/index.ts';
import { AppError, errorService, tarjetaService } from '#lib/services/index.ts';

/**
 * La tarjeta completa del owner en sesión. Se trae con UNA sola petición (`GET /tarjetas/mia`)
 * justo después del login y se reutiliza en toda la carga de la app; el editor la reemplaza al
 * guardar cada cambio.
 */

export type EstadoMiTarjeta = 'inicial' | 'cargando' | 'lista' | 'sin-tarjeta' | 'error';

export interface MiTarjetaState {
	estado: EstadoMiTarjeta;
	tarjeta: TarjetaCompleta | null;
	error: string | null;
}

const ESTADO_INICIAL: MiTarjetaState = { estado: 'inicial', tarjeta: null, error: null };

const store = writable<MiTarjetaState>(ESTADO_INICIAL);
let pendiente: Promise<void> | null = null;

export const miTarjetaStore = {
	subscribe: store.subscribe,

	/** Trae la tarjeta si aún no está (o siempre, con `forzar`). Nunca lanza: el error queda en el estado */
	cargar(forzar = false): Promise<void> {
		const { estado } = get(store);
		if (!forzar && (estado === 'lista' || estado === 'sin-tarjeta')) return Promise.resolve();

		pendiente ??= (async () => {
			store.update((actual) => ({ ...actual, estado: 'cargando', error: null }));
			try {
				const tarjeta = await tarjetaService.obtenerMia();
				store.set({ estado: 'lista', tarjeta, error: null });
			} catch (error) {
				if (error instanceof AppError && error.status === 404) {
					store.set({ estado: 'sin-tarjeta', tarjeta: null, error: null });
				} else {
					store.set({ estado: 'error', tarjeta: null, error: errorService.getMessage(error) });
				}
			} finally {
				pendiente = null;
			}
		})();
		return pendiente;
	},

	/** Reemplaza la tarjeta (al crearla o tras guardar cambios en el editor) */
	set(tarjeta: TarjetaCompleta): void {
		store.set({ estado: 'lista', tarjeta, error: null });
	},

	/** Al cerrar sesión */
	reiniciar(): void {
		pendiente = null;
		store.set(ESTADO_INICIAL);
	}
};
