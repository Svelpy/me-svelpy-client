import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import CapsuleTabs from './capsuleTabs.svelte';

type Item = { id: string; label: string };

const items: Item[] = [
	{ id: 'a', label: 'Inmobiliaria' },
	{ id: 'b', label: 'Odontología' },
	{ id: 'c', label: 'Ejecutivo' }
];

// El panel se identifica por su aria-labelledby, que apunta a la pestaña activa.
const panel = createRawSnippet(() => ({ render: () => '<p>Contenido</p>' }));

async function renderTabs(onselect?: (id: string) => void) {
	return await render(CapsuleTabs<Item>, {
		items,
		label: 'Perfiles',
		idPrefix: 't',
		panel,
		onselect
	});
}

describe('CapsuleTabs', () => {
	it('selecciona la primera pestaña y la asocia al panel', async () => {
		const screen = await renderTabs();
		const tab = screen.getByRole('tab', { name: 'Inmobiliaria' });
		await expect.element(tab).toHaveAttribute('aria-selected', 'true');
		await expect.element(tab).toHaveAttribute('tabindex', '0');
		await expect
			.element(screen.getByRole('tabpanel'))
			.toHaveAttribute('aria-labelledby', 't-tab-a');
	});

	it('cambia de panel al hacer clic y avisa con onselect', async () => {
		const elegidas: string[] = [];
		const screen = await renderTabs((id) => elegidas.push(id));
		await screen.getByRole('tab', { name: 'Ejecutivo' }).click();
		await expect
			.element(screen.getByRole('tabpanel'))
			.toHaveAttribute('aria-labelledby', 't-tab-c');
		await expect
			.element(screen.getByRole('tab', { name: 'Inmobiliaria' }))
			.toHaveAttribute('tabindex', '-1');
		expect(elegidas).toEqual(['c']);
	});

	it('se recorre con flechas, Inicio y Fin (con vuelta al principio)', async () => {
		const screen = await renderTabs();
		await screen.getByRole('tab', { name: 'Inmobiliaria' }).click();

		await userEvent.keyboard('{ArrowRight}');
		await expect.element(screen.getByRole('tab', { name: 'Odontología' })).toHaveFocus();
		await expect
			.element(screen.getByRole('tabpanel'))
			.toHaveAttribute('aria-labelledby', 't-tab-b');

		await userEvent.keyboard('{End}');
		await expect.element(screen.getByRole('tab', { name: 'Ejecutivo' })).toHaveFocus();

		await userEvent.keyboard('{ArrowRight}');
		await expect.element(screen.getByRole('tab', { name: 'Inmobiliaria' })).toHaveFocus();

		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(screen.getByRole('tab', { name: 'Ejecutivo' })).toHaveFocus();

		await userEvent.keyboard('{Home}');
		await expect
			.element(screen.getByRole('tab', { name: 'Inmobiliaria' }))
			.toHaveAttribute('aria-selected', 'true');
	});
});
