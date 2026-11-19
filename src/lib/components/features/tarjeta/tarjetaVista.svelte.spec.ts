import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tarjetaDePrueba } from './tarjetaDePrueba.ts';
import TarjetaVista from './tarjetaVista.svelte';

/** Títulos de las secciones, en el orden en que aparecen */
function titulos(contenedor: HTMLElement): string[] {
	return [...contenedor.querySelectorAll('section h2')].map((h) => h.textContent?.trim() ?? '');
}

describe('TarjetaVista', () => {
	it('muestra la identidad y las secciones con contenido, en su orden', async () => {
		const screen = await render(TarjetaVista, { tarjeta: tarjetaDePrueba() });
		await expect
			.element(screen.getByRole('heading', { level: 1, name: 'Dra. Lucía Prueba' }))
			.toBeVisible();
		// Vitrina, ubicación, redes, formación y certificaciones están vacías: no se muestran
		expect(titulos(screen.container)).toEqual([
			'Accesos rápidos',
			'Acerca de mí',
			'Contacto',
			'Preguntas frecuentes'
		]);
	});

	it('respeta el orden, la visibilidad y el título propio de cada sección', async () => {
		const base = tarjetaDePrueba();
		const secciones = base.secciones.map((seccion) => {
			if (seccion.clave === 'faq') return { ...seccion, orden: -1, titulo: 'Dudas frecuentes' };
			if (seccion.clave === 'acerca') return { ...seccion, is_visible: false };
			return seccion;
		});
		const screen = await render(TarjetaVista, { tarjeta: { ...base, secciones } });
		expect(titulos(screen.container)).toEqual(['Dudas frecuentes', 'Accesos rápidos', 'Contacto']);
	});

	it('entrega la paleta del profesional como variables del tema', async () => {
		const screen = await render(TarjetaVista, { tarjeta: tarjetaDePrueba() });
		const raiz = screen.getByTestId('tarjeta-vista');
		await expect.element(raiz).toBeInTheDocument();
		// Las utilidades `bg-t-fondo`, `text-t-titulo`… leen estas variables (tema Salud)
		const estilo = (raiz.element() as HTMLElement).style;
		expect(estilo.getPropertyValue('--t-fondo')).toBe('#F7FBFA');
		expect(estilo.getPropertyValue('--t-primario')).toBe(tarjetaDePrueba().theme.color_primario);
	});

	it('en vista previa no se puede interactuar (es el espejo del editor)', async () => {
		const screen = await render(TarjetaVista, { tarjeta: tarjetaDePrueba(), modo: 'vista-previa' });
		await expect.element(screen.getByTestId('tarjeta-vista')).toHaveAttribute('inert');
	});

	it('en público se puede guardar el contacto', async () => {
		const screen = await render(TarjetaVista, { tarjeta: tarjetaDePrueba(), modo: 'publica' });
		await expect.element(screen.getByTestId('tarjeta-vista')).not.toHaveAttribute('inert');
		await expect.element(screen.getByRole('button', { name: /Guardar contacto/ })).toBeVisible();
	});
});
