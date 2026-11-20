import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Combobox, { type OpcionCombobox } from './combobox.svelte';

const opciones: OpcionCombobox[] = [
	{ valor: 'Pediatría', etiqueta: 'Pediatría', grupo: 'Salud' },
	{ valor: 'Odontología', etiqueta: 'Odontología', grupo: 'Salud' },
	{ valor: 'Abogacía corporativa', etiqueta: 'Abogacía corporativa', grupo: 'Legal' },
	{ valor: 'Agente inmobiliario', etiqueta: 'Agente inmobiliario', grupo: 'Inmobiliaria' }
];

describe('Combobox', () => {
	it('filtra sin importar tildes ni mayúsculas', async () => {
		const screen = await render(Combobox, { label: 'Rubro', value: '', opciones });
		const campo = screen.getByRole('combobox', { name: 'Rubro' });
		await campo.fill('PEDIATRIA');

		await expect.element(campo).toHaveAttribute('aria-expanded', 'true');
		const lista = screen.getByRole('listbox', { name: 'Rubro' });
		await expect.element(lista.getByRole('option', { name: 'Pediatría' })).toBeVisible();
		await expect
			.element(lista.getByRole('option', { name: 'Odontología' }))
			.not.toBeInTheDocument();
	});

	it('se elige con el teclado y avisa la opción', async () => {
		const elegidas: (OpcionCombobox | null)[] = [];
		const screen = await render(Combobox, {
			label: 'Rubro',
			value: '',
			opciones,
			onseleccionar: (_valor: string, opcion: OpcionCombobox | null) => elegidas.push(opcion)
		});
		const campo = screen.getByRole('combobox', { name: 'Rubro' });
		await campo.fill('a');
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(campo).toHaveAttribute('aria-activedescendant');
		await userEvent.keyboard('{Enter}');

		// Primero las que empiezan con lo escrito
		await expect.element(campo).toHaveValue('Abogacía corporativa');
		await expect.element(campo).toHaveAttribute('aria-expanded', 'false');
		expect(elegidas.at(-1)?.valor).toBe('Abogacía corporativa');
	});

	it('acepta texto libre cuando el rubro no está en la lista', async () => {
		const valores: string[] = [];
		const screen = await render(Combobox, {
			label: 'Rubro',
			value: '',
			opciones,
			onseleccionar: (valor: string) => valores.push(valor)
		});
		await screen.getByRole('combobox', { name: 'Rubro' }).fill('Apicultura');
		expect(valores.at(-1)).toBe('Apicultura');
	});

	it('ofrece usar lo escrito cuando no está en la lista', async () => {
		const valores: string[] = [];
		const screen = await render(Combobox, {
			label: 'Rubro',
			value: '',
			opciones,
			etiquetaLibre: 'Rubro propio',
			onseleccionar: (valor: string) => valores.push(valor)
		});
		const campo = screen.getByRole('combobox', { name: 'Rubro' });
		await campo.fill('Apicultura');
		const propia = screen.getByRole('option', { name: /Usar «Apicultura»/ });
		await expect.element(propia).toBeVisible();

		await propia.click();
		await expect.element(campo).toHaveValue('Apicultura');
		expect(valores.at(-1)).toBe('Apicultura');

		// Si coincide exactamente con una del catálogo, no se ofrece aparte
		await campo.fill('pediatría');
		await expect.element(screen.getByRole('option', { name: /Usar «/ })).not.toBeInTheDocument();
	});

	it('Escape cierra la lista', async () => {
		const screen = await render(Combobox, { label: 'Rubro', value: '', opciones });
		const campo = screen.getByRole('combobox', { name: 'Rubro' });
		await campo.fill('o');
		await expect.element(campo).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{Escape}');
		await expect.element(campo).toHaveAttribute('aria-expanded', 'false');
	});
});
