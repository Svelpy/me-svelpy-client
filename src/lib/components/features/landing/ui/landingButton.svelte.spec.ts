import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import LandingButton from './landingButton.svelte';

const texto = (t: string) => createRawSnippet(() => ({ render: () => `<span>${t}</span>` }));

describe('LandingButton', () => {
	it('se renderiza como enlace cuando recibe href', async () => {
		const screen = await render(LandingButton, { href: '#planes', children: texto('Ver planes') });
		const link = screen.getByRole('link', { name: 'Ver planes' });
		await expect.element(link).toHaveAttribute('href', '#planes');
		await expect.element(link).not.toHaveAttribute('target');
	});

	it('abre los enlaces externos en otra pestaña de forma segura', async () => {
		const screen = await render(LandingButton, {
			href: 'https://wa.me/000',
			external: true,
			children: texto('WhatsApp')
		});
		const link = screen.getByRole('link', { name: 'WhatsApp' });
		await expect.element(link).toHaveAttribute('target', '_blank');
		await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('se renderiza como botón type="button" sin href', async () => {
		let clics = 0;
		const screen = await render(LandingButton, {
			onclick: () => clics++,
			children: texto('Guardar')
		});
		const boton = screen.getByRole('button', { name: 'Guardar' });
		await expect.element(boton).toHaveAttribute('type', 'button');
		await boton.click();
		expect(clics).toBe(1);
	});
});
