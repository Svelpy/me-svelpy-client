import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ListaOrdenable from './listaOrdenable.svelte';

interface Item {
	id: string;
	titulo: string;
	is_visible: boolean;
}

const inicial: Item[] = [
	{ id: 'a', titulo: 'Consultorio Norte', is_visible: true },
	{ id: 'b', titulo: 'Consultorio Sur', is_visible: true },
	{ id: 'c', titulo: 'Clínica Central', is_visible: false }
];

const fila = createRawSnippet((item: () => Item) => ({
	render: () => `<span>${item().titulo}</span>`
}));

interface Acciones {
	onMover?: (ids: string[]) => Promise<void>;
	onEditar?: (item: Item) => void;
	onEliminar?: (item: Item) => void;
	onVisible?: (item: Item, visible: boolean) => Promise<void>;
}

function montar(cambios: Acciones = {}) {
	return render(ListaOrdenable<Item>, {
		items: inicial,
		nombre: (item: Item) => item.titulo,
		fila,
		etiqueta: 'Ubicaciones',
		onMover: async () => {},
		onEditar: () => {},
		onEliminar: () => {},
		...cambios
	});
}

describe('ListaOrdenable', () => {
	it('muestra cada elemento con su contenido', async () => {
		const screen = await montar();
		const lista = screen.getByRole('list', { name: 'Ubicaciones' });
		await expect.element(lista).toBeInTheDocument();
		expect(lista.getByRole('listitem').all()).toHaveLength(3);
		await expect.element(lista.getByText('Consultorio Sur')).toBeVisible();
	});

	it('mueve con botones y anuncia el elemento correcto aunque la lista ya cambió', async () => {
		const pedidos: string[][] = [];
		const screen = await montar({
			onMover: async (ids: string[]) => {
				pedidos.push(ids);
				// Como el panel: aplica el orden nuevo antes de que termine la petición
				await screen.rerender({ items: ids.map((id) => inicial.find((item) => item.id === id)!) });
			}
		});
		await expect
			.element(screen.getByRole('button', { name: 'Subir Consultorio Norte' }))
			.toBeDisabled();
		await expect
			.element(screen.getByRole('button', { name: 'Bajar Clínica Central' }))
			.toBeDisabled();

		await screen.getByRole('button', { name: 'Subir Consultorio Sur' }).click();
		expect(pedidos).toEqual([['b', 'a', 'c']]);
		await expect
			.element(screen.getByText('Consultorio Sur quedó en el lugar 1 de 3.'))
			.toBeInTheDocument();
	});

	it('el interruptor muestra u oculta cada elemento', async () => {
		const cambios: [string, boolean][] = [];
		const screen = await montar({
			onVisible: async (item: Item, visible: boolean) => {
				cambios.push([item.id, visible]);
			}
		});
		await screen.getByRole('switch', { name: 'Ocultar Consultorio Norte en la tarjeta' }).click();
		await screen.getByRole('switch', { name: 'Mostrar Clínica Central en la tarjeta' }).click();
		expect(cambios).toEqual([
			['a', false],
			['c', true]
		]);
	});

	it('editar y eliminar avisan qué elemento se eligió', async () => {
		const editados: string[] = [];
		const eliminados: string[] = [];
		const screen = await montar({
			onEditar: (item: Item) => editados.push(item.id),
			onEliminar: (item: Item) => eliminados.push(item.id)
		});
		await screen.getByRole('button', { name: 'Editar Consultorio Sur' }).click();
		await screen.getByRole('button', { name: 'Eliminar Clínica Central' }).click();
		expect(editados).toEqual(['b']);
		expect(eliminados).toEqual(['c']);
	});
});
