import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Switch from './switch.svelte';

describe('Switch', () => {
	it('cambia de estado al hacer clic y avisa el valor nuevo', async () => {
		const valores: boolean[] = [];
		const screen = await render(Switch, {
			label: 'Cuenta activa',
			checked: false,
			onchange: (valor: boolean) => valores.push(valor)
		});
		const interruptor = screen.getByRole('switch', { name: 'Cuenta activa' });
		await expect.element(interruptor).toHaveAttribute('aria-checked', 'false');

		await interruptor.click();
		await expect.element(interruptor).toHaveAttribute('aria-checked', 'true');
		expect(valores).toEqual([true]);
	});

	it('con la etiqueta oculta conserva su nombre accesible', async () => {
		const screen = await render(Switch, {
			label: 'Mostrar Instagram en la tarjeta',
			etiquetaOculta: true
		});
		await expect
			.element(screen.getByRole('switch', { name: 'Mostrar Instagram en la tarjeta' }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByText('Mostrar Instagram en la tarjeta'))
			.not.toBeInTheDocument();
	});

	it('deshabilitado no cambia', async () => {
		const valores: boolean[] = [];
		const screen = await render(Switch, {
			label: 'Cuenta activa',
			checked: true,
			disabled: true,
			onchange: (valor: boolean) => valores.push(valor)
		});
		const interruptor = screen.getByRole('switch', { name: 'Cuenta activa' });
		await expect.element(interruptor).toBeDisabled();
		await interruptor.click({ force: true });
		await expect.element(interruptor).toHaveAttribute('aria-checked', 'true');
		expect(valores).toEqual([]);
	});
});
