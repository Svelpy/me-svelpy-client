import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { aPublica } from '#lib/utils/tarjeta.ts';
import { tarjetaCompletaDePrueba, tarjetaDePrueba } from './tarjetaDePrueba.ts';
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
		expect(titulos(screen.container)).toEqual(['Acerca de mí', 'Contacto', 'Preguntas frecuentes']);
	});

	it('respeta el orden, la visibilidad y el título propio de cada sección', async () => {
		const base = tarjetaCompletaDePrueba();
		const secciones = base.secciones.map((seccion) => {
			if (seccion.clave === 'faq') return { ...seccion, orden: -1, titulo: 'Dudas frecuentes' };
			if (seccion.clave === 'acerca') return { ...seccion, is_visible: false };
			return seccion;
		});
		// Lo mismo que publica la API: solo lo visible, en su orden
		const screen = await render(TarjetaVista, { tarjeta: aPublica({ ...base, secciones }) });
		expect(titulos(screen.container)).toEqual(['Dudas frecuentes', 'Contacto']);
	});

	it('el QR de pago y la agenda se ofrecen en Contacto', async () => {
		const screen = await render(TarjetaVista, {
			tarjeta: tarjetaDePrueba({
				qr_pago_url: 'https://res.cloudinary.com/demo/qr.png',
				redes: [{ id: 'r1', red: 'calendly', url: 'https://calendly.com/lucia', username: null }]
			})
		});
		await expect.element(screen.getByRole('button', { name: 'Pagar con QR' })).toBeVisible();
		await expect.element(screen.getByRole('link', { name: 'Agendar cita' })).toBeVisible();
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
