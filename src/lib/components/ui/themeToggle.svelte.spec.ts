import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { TEMA_UI_KEY } from '#lib/constants/keys.ts';
import { modoColor } from '#lib/stores/temaUi.ts';
import ThemeToggle from './themeToggle.svelte';

afterEach(() => {
	modoColor.set('claro');
	localStorage.removeItem(TEMA_UI_KEY);
});

describe('ThemeToggle', () => {
	it('el modo oscuro se aplica a la página y se guarda en el navegador', async () => {
		const screen = await render(ThemeToggle);
		const oscuro = screen.getByRole('radio', { name: 'Modo oscuro' });
		await oscuro.click();

		await expect.element(oscuro).toHaveAttribute('aria-checked', 'true');
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(localStorage.getItem(TEMA_UI_KEY)).toBe('oscuro');
	});

	it('el modo claro quita el oscuro', async () => {
		modoColor.set('oscuro');
		const screen = await render(ThemeToggle);
		await screen.getByRole('radio', { name: 'Modo claro' }).click();
		expect(document.documentElement.classList.contains('dark')).toBe(false);
	});

	it('se maneja con las flechas como un grupo de radios', async () => {
		modoColor.set('claro');
		const screen = await render(ThemeToggle);
		const grupo = screen.getByRole('radiogroup', { name: 'Modo de color' });
		await expect.element(grupo).toBeInTheDocument();

		const claro = screen.getByRole('radio', { name: 'Modo claro' });
		await expect.element(claro).toHaveAttribute('tabindex', '0');
		(claro.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}');

		const oscuro = screen.getByRole('radio', { name: 'Modo oscuro' });
		await expect.element(oscuro).toHaveAttribute('aria-checked', 'true');
		await expect.element(oscuro).toHaveFocus();
	});
});
