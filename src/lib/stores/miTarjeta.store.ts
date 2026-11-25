import { writable } from 'svelte/store';
import type { TarjetaCompleta } from '#lib/interfaces/index.ts';

/**
 * La tarjeta completa del user en sesión. Llega con `GET /usuarios/me` (en el login y una vez por
 * carga de la app, `authStore`) y se reutiliza en todo el panel; el editor la reemplaza al guardar
 * cada cambio.
 */

export type EstadoMiTarjeta = 'inicial' | 'lista' | 'sin-tarjeta';

export interface MiTarjetaState {
	estado: EstadoMiTarjeta;
	tarjeta: TarjetaCompleta | null;
}

const ESTADO_INICIAL: MiTarjetaState = { estado: 'inicial', tarjeta: null };

const store = writable<MiTarjetaState>(ESTADO_INICIAL);

export const miTarjetaStore = {
	subscribe: store.subscribe,

	/** Lo que trajo `/usuarios/me`: la tarjeta o null si la cuenta todavía no tiene */
	establecer(tarjeta: TarjetaCompleta | null): void {
		store.set(tarjeta ? { estado: 'lista', tarjeta } : { estado: 'sin-tarjeta', tarjeta: null });
	},

	/** Reemplaza la tarjeta (al crearla o tras guardar cambios en el editor) */
	set(tarjeta: TarjetaCompleta): void {
		store.set({ estado: 'lista', tarjeta });
	},

	/** Al cerrar sesión */
	reiniciar(): void {
		store.set(ESTADO_INICIAL);
	}
};
