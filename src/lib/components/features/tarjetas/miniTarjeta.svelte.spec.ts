import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
import { tarjetaListItemDePrueba } from '../tarjeta/tarjetaDePrueba.ts';
import MiniTarjeta from './miniTarjeta.svelte';

const hexARgb = (hex: string) => {
	const n = Number.parseInt(hex.slice(1), 16);
	return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

describe('MiniTarjeta', () => {
	it('enlaza al editor y muestra nombre, cargo, dirección y estado', async () => {
		const screen = await render(MiniTarjeta, {
			tarjeta: tarjetaListItemDePrueba(),
			href: '/panel/tarjetas/tarjeta-1'
		});
		const enlace = screen.getByRole('link', { name: /Dra\. Lucía Prueba/ });
		await expect.element(enlace).toHaveAttribute('href', '/panel/tarjetas/tarjeta-1');
		await expect.element(enlace.getByText('Pediatra', { exact: true })).toBeVisible();
		await expect.element(enlace.getByText('/doctora-prueba', { exact: true })).toBeVisible();
		await expect.element(enlace.getByText('Publicada', { exact: true })).toBeVisible();
	});

	it('sin cargo muestra el rubro, y un borrador se marca como tal', async () => {
		const screen = await render(MiniTarjeta, {
			tarjeta: tarjetaListItemDePrueba({ cargo: null, is_public: false, published_at: null }),
			href: '/panel/tarjetas/tarjeta-1'
		});
		const enlace = screen.getByRole('link');
		await expect.element(enlace.getByText('Pediatría', { exact: true })).toBeVisible();
		await expect.element(enlace.getByText('Borrador', { exact: true })).toBeVisible();
	});

	it('usa los colores de su tema, no los del panel', async () => {
		const screen = await render(MiniTarjeta, {
			tarjeta: tarjetaListItemDePrueba(),
			href: '/panel/tarjetas/tarjeta-1'
		});
		// El nombre va con el color de títulos del tema Salud
		await expect
			.element(screen.getByText('Dra. Lucía Prueba'))
			.toHaveStyle({ color: hexARgb(TEMAS_TARJETA.salud.colores.color_titulo) });
	});
});
