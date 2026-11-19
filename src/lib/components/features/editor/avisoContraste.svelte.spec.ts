import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
import AvisoContraste from './avisoContraste.svelte';

describe('AvisoContraste', () => {
	it('con un tema legible lo confirma sin alarmar', async () => {
		const screen = await render(AvisoContraste, { colores: TEMAS_TARJETA.salud.colores });
		await expect
			.element(screen.getByRole('status'))
			.toHaveTextContent('Todas las combinaciones se leen bien.');
		await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
	});

	it('señala cada combinación difícil de leer con su contraste y el mínimo', async () => {
		const colores = { ...TEMAS_TARJETA.salud.colores, color_texto: '#E8EEEC' };
		const screen = await render(AvisoContraste, { colores });
		const alerta = screen.getByRole('alert');
		await expect.element(alerta.getByText('Algunas combinaciones cuestan leerse')).toBeVisible();

		const items = alerta.getByRole('listitem');
		await expect.element(items.first()).toBeVisible();
		const pares = items.elements().map((li) => li.textContent?.replace(/\s+/g, ' ').trim() ?? '');
		expect(pares.find((par) => par.startsWith('Texto sobre el fondo:'))).toMatch(
			/^Texto sobre el fondo: [\d,]+:1 \(mínimo 4,5:1\)$/
		);
		// Solo lo que falla: los títulos siguen leyéndose bien
		expect(pares.some((par) => par.startsWith('Títulos'))).toBe(false);
	});
});
