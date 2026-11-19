import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AlertBox from './alertBox.svelte';

const html = (contenido: string) => createRawSnippet(() => ({ render: () => contenido }));

describe('AlertBox', () => {
	it('un error se anuncia de inmediato (role="alert") con su título y mensaje', async () => {
		const screen = await render(AlertBox, {
			variant: 'error',
			title: 'No se pudo guardar',
			children: html('<p>Revisa tu conexión.</p>')
		});
		const alerta = screen.getByRole('alert');
		await expect.element(alerta.getByText('No se pudo guardar')).toBeVisible();
		await expect.element(alerta.getByText('Revisa tu conexión.')).toBeVisible();
	});

	it('la información es un estado que no interrumpe (role="status")', async () => {
		const screen = await render(AlertBox, {
			variant: 'info',
			children: html('<p>Los cambios se ven al instante.</p>')
		});
		await expect
			.element(screen.getByRole('status').getByText('Los cambios se ven al instante.'))
			.toBeVisible();
		await expect.element(screen.getByRole('alert')).not.toBeInTheDocument();
	});

	it('muestra la acción que recibe', async () => {
		const screen = await render(AlertBox, {
			variant: 'warning',
			title: 'Tu tarjeta está en borrador',
			accion: html('<button type="button">Publicar</button>')
		});
		await expect.element(screen.getByRole('button', { name: 'Publicar' })).toBeVisible();
	});
});
