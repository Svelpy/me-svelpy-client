import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ColorField from './colorField.svelte';

describe('ColorField', () => {
	it('acepta el código escrito, aun corto, y lo entrega normalizado', async () => {
		const colores: string[] = [];
		const screen = await render(ColorField, {
			label: 'Color principal',
			value: '#0F766E',
			onchange: (hex: string) => colores.push(hex)
		});
		const campo = screen.getByRole('textbox', { name: 'Color principal' });
		await expect.element(campo).toHaveValue('#0F766E');

		await campo.fill('#abc');
		expect(colores.at(-1)).toBe('#AABBCC');
		await expect.element(campo).not.toHaveAttribute('aria-invalid');
	});

	it('marca un código inválido sin cambiar el color', async () => {
		const colores: string[] = [];
		const screen = await render(ColorField, {
			label: 'Color principal',
			value: '#0F766E',
			onchange: (hex: string) => colores.push(hex)
		});
		const campo = screen.getByRole('textbox', { name: 'Color principal' });
		await campo.fill('verde');
		await expect.element(campo).toHaveAttribute('aria-invalid', 'true');
		expect(colores).toEqual([]);
	});

	it('el selector nativo tiene su propio nombre', async () => {
		const screen = await render(ColorField, { label: 'Color principal', value: '#0F766E' });
		await expect
			.element(screen.getByLabelText('Elegir color principal en la paleta'))
			.toHaveValue('#0f766e');
	});

	it('muestra el error que recibe', async () => {
		const screen = await render(ColorField, {
			label: 'Color principal',
			value: '#0F766E',
			error: 'Usa un color más oscuro.'
		});
		await expect.element(screen.getByText('Usa un color más oscuro.')).toBeVisible();
		await expect
			.element(screen.getByRole('textbox', { name: 'Color principal' }))
			.toHaveAttribute('aria-invalid', 'true');
	});
});
