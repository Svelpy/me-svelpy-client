import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
import PaletteDemo from './paletteDemo.svelte';

describe('PaletteDemo', () => {
	it('muestra un tema por cada preset y empieza con el primero', async () => {
		const screen = await render(PaletteDemo, { temas: TEMAS_TARJETA });
		for (const tema of Object.values(TEMAS_TARJETA)) {
			await expect.element(screen.getByRole('radio', { name: tema.nombre })).toBeInTheDocument();
		}
		await expect.element(screen.getByRole('radio', { name: 'Claro' })).toBeChecked();
		await expect
			.element(screen.getByTestId('palette-preview'))
			.toHaveAttribute('data-preset', 'claro');
	});

	it('aplica los colores del tema elegido a la vista previa', async () => {
		const screen = await render(PaletteDemo, {
			temas: TEMAS_TARJETA,
			nota: 'Después puedes cambiar cada color.'
		});
		await screen.getByText('Salud', { exact: true }).click();
		await expect.element(screen.getByRole('radio', { name: 'Salud' })).toBeChecked();

		const vista = screen.getByTestId('palette-preview');
		await expect.element(vista).toHaveAttribute('data-preset', 'salud');
		await expect.element(vista).toHaveStyle({ backgroundColor: 'rgb(247, 251, 250)' });
		await expect.element(screen.getByRole('group', { name: 'Tema inicial: Salud' })).toBeVisible();
		await expect.element(screen.getByText('Después puedes cambiar cada color.')).toBeVisible();
	});
});
