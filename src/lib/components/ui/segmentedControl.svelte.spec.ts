import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SegmentedControl from './segmentedControl.svelte';

const opciones = [
	{ value: 'todas', label: 'Todas' },
	{ value: 'publicada', label: 'Publicadas' },
	{ value: 'borrador', label: 'Borradores' }
];

describe('SegmentedControl', () => {
	it('agrupa las opciones bajo su etiqueta y marca la elegida', async () => {
		const screen = await render(SegmentedControl, {
			label: 'Estado',
			options: opciones,
			value: 'todas'
		});
		const grupo = screen.getByRole('group', { name: 'Estado' });
		await expect.element(grupo).toBeInTheDocument();
		await expect.element(grupo.getByRole('radio', { name: 'Todas' })).toBeChecked();
		await expect.element(grupo.getByRole('radio', { name: 'Borradores' })).not.toBeChecked();
	});

	it('al elegir otra opción la marca y avisa su valor', async () => {
		const elegidos: string[] = [];
		const screen = await render(SegmentedControl, {
			label: 'Estado',
			options: opciones,
			value: 'todas',
			onchange: (valor: string) => elegidos.push(valor)
		});
		await screen.getByText('Borradores', { exact: true }).click();
		await expect.element(screen.getByRole('radio', { name: 'Borradores' })).toBeChecked();
		expect(elegidos).toEqual(['borrador']);
	});
});
