import { browser } from '$app/env';
import { writable } from 'svelte/store';
import { TEMA_UI_KEY } from '#lib/constants/keys.ts';

/**
 * Modo de color del panel, el login y las páginas de error: claro, oscuro o el del sistema.
 * Se guarda por navegador (`me::ui::tema`) y se aplica como clase `.dark` en <html>; el script de
 * app.html aplica lo mismo antes del primer pintado para que no haya destello.
 */

export type ModoColor = 'claro' | 'oscuro' | 'sistema';

const MODOS: ModoColor[] = ['claro', 'oscuro', 'sistema'];

function leerGuardado(): ModoColor {
	try {
		const valor = localStorage.getItem(TEMA_UI_KEY);
		return MODOS.includes(valor as ModoColor) ? (valor as ModoColor) : 'sistema';
	} catch {
		return 'sistema';
	}
}

function aplicar(modo: ModoColor): void {
	const oscuro =
		modo === 'oscuro' ||
		(modo === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches);
	document.documentElement.classList.toggle('dark', oscuro);
}

const modo = writable<ModoColor>(browser ? leerGuardado() : 'sistema');

if (browser) {
	// En modo sistema, sigue los cambios del sistema operativo mientras la app está abierta
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		let actual: ModoColor = 'sistema';
		modo.subscribe((valor) => (actual = valor))();
		if (actual === 'sistema') aplicar('sistema');
	});
}

export const modoColor = {
	subscribe: modo.subscribe,
	set(nuevo: ModoColor): void {
		modo.set(nuevo);
		if (!browser) return;
		try {
			localStorage.setItem(TEMA_UI_KEY, nuevo);
		} catch {
			// Sin almacenamiento: vale para esta visita
		}
		aplicar(nuevo);
	}
};
