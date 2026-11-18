import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PaletteDemo from './paletteDemo.svelte';

/** Color de marca que la vista previa recibe como variable CSS inline. */
const marca = (el: Element) => (el as HTMLElement).style.getPropertyValue('--marca');

const colores = [
	{ nombre: 'Azul inmobiliario', fondo: '#1E3A8A', acento: '#F59E0B' },
	{ nombre: 'Verde clínica', fondo: '#0F766E', acento: '#F472B6' }
];

describe('PaletteDemo', () => {
	it('empieza con el primer color elegido', async () => {
		const screen = await render(PaletteDemo, { colores });
		await expect.element(screen.getByRole('radio', { name: 'Azul inmobiliario' })).toBeChecked();
		await expect.poll(() => marca(screen.getByTestId('palette-preview').element())).toBe('#1E3A8A');
	});

	it('cambia la vista previa al elegir otro color', async () => {
		const screen = await render(PaletteDemo, { colores });
		await screen.getByText('Verde clínica', { exact: true }).click();
		await expect.element(screen.getByRole('radio', { name: 'Verde clínica' })).toBeChecked();
		await expect.poll(() => marca(screen.getByTestId('palette-preview').element())).toBe('#0F766E');
		await expect
			.element(screen.getByRole('group', { name: 'Prueba un color: Verde clínica' }))
			.toBeVisible();
	});
});
