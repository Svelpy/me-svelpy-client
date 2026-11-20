import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ReservaEnlace from './reservaEnlace.svelte';

describe('ReservaEnlace', () => {
	it('convierte lo escrito en un enlace válido', async () => {
		const screen = await render(ReservaEnlace);
		const campo = screen.getByRole('textbox', { name: 'Tu enlace' });
		await campo.fill('Dra. Fabiola Pérez');
		await expect.element(campo).toHaveValue('dra-fabiola-perez');
		await expect.element(campo).toHaveAttribute('name', 'enlace');
	});

	it('envía al registro por GET y el botón nombra la acción', async () => {
		const screen = await render(ReservaEnlace, { cta: 'Crear mi ME gratis' });
		const boton = screen.getByRole('button', { name: 'Crear mi ME gratis' });
		await expect.element(boton).toHaveAttribute('type', 'submit');
		const form = boton.element().closest('form');
		expect(form?.getAttribute('method')).toBe('GET');
		expect(form?.getAttribute('action')).toMatch(/\/auth\/sign-up$/);
	});
});
