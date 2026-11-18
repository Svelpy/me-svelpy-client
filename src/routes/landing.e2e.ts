import { expect, test } from '@playwright/test';

// La landing es estática (prerenderizada) y no consulta el backend: no hace falta mockear la API.

test.describe('Landing ME by Svelpy', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('expone los metadatos de SEO, Open Graph y JSON-LD', async ({ page }) => {
		await expect(page).toHaveTitle('ME | Tarjeta digital profesional con SEO y GEO');
		await expect(page.locator('html')).toHaveAttribute('lang', 'es');
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			/guarda tu contacto en un toque/
		);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			/^https?:\/\/.+\/$/
		);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			/^https?:\/\/.+\/images\/landing\/og-me-by-svelpy\.png$/
		);
		await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
			'content',
			'1200'
		);
		await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
			'content',
			'summary_large_image'
		);

		const jsonLd = JSON.parse(
			(await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}'
		);
		const tipos = jsonLd['@graph'].map((n: { '@type': string }) => n['@type']);
		expect(tipos).toEqual(['Organization', 'WebSite', 'Service', 'FAQPage']);
		const faq = jsonLd['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage');
		expect(faq.mainEntity).toHaveLength(4);

		const og = await page.request.get('/images/landing/og-me-by-svelpy.png');
		expect(og.ok()).toBe(true);
	});

	test('muestra el titular y las llamadas a la acción del hero', async ({ page }) => {
		await expect(
			page.getByRole('heading', {
				level: 1,
				name: 'Que no solo guarden tu contacto: haz que te encuentren primero.'
			})
		).toBeVisible();
		await expect(
			page.getByRole('link', { name: 'Ver perfiles de ejemplo en vivo' })
		).toHaveAttribute('href', '#sectores');
		await expect(
			page
				.getByRole('navigation', { name: 'Principal' })
				.getByRole('link', { name: 'Iniciar sesión' })
		).toHaveAttribute('href', '/auth/sign-in');
	});

	test('los botones de WhatsApp abren el chat de ventas con un mensaje', async ({ page }) => {
		const wa = /^https:\/\/wa\.me\/59176727537\?text=/;

		const quiero = page.getByRole('link', { name: 'Quiero mi ME', exact: true }).first();
		await expect(quiero).toHaveAttribute('href', wa);
		await expect(quiero).toHaveAttribute('target', '_blank');
		await expect(quiero).toHaveAttribute('rel', 'noopener noreferrer');

		await expect(page.getByRole('link', { name: 'Crear mi ME ahora' })).toHaveAttribute('href', wa);
		await expect(page.getByRole('link', { name: 'Solicitar mi ME por WhatsApp' })).toHaveAttribute(
			'href',
			/text=Hola%2C%20quiero%20crear%20mi%20ME\.$/
		);
		await expect(
			page.getByRole('link', { name: 'Cotizar Plan Corporativo para mi equipo' })
		).toHaveAttribute('href', /^https:\/\/wa\.me\/59176727537\?text=.*Plan%20Corporativo/);
	});

	test('el selector del hero cambia el perfil del teléfono y se puede pausar', async ({ page }) => {
		const hero = page.getByRole('group', { name: 'Perfiles de ejemplo' });
		const url = hero.getByTestId('phone-url');
		await expect(url).toHaveText('me.svelpy.com/valeria-rojas');

		await hero.getByRole('tab', { name: 'Odontología' }).click();
		await expect(url).toHaveText('me.svelpy.com/dra-camila-rivas');
		await expect(
			hero.getByRole('img', { name: /Tarjeta física ME de Dra\. Camila Rivas/ })
		).toBeVisible();
		await expect(
			hero.getByRole('img', { name: /Perfil ME de la Dra\. Camila Rivas/ })
		).toBeVisible();

		// Elegir un perfil detiene la rotación automática.
		await expect(
			hero.getByRole('button', { name: 'Reanudar la rotación de perfiles' })
		).toBeVisible();
		await page.waitForTimeout(5000);
		await expect(url).toHaveText('me.svelpy.com/dra-camila-rivas');
	});

	test('los enlaces del menú llevan a su sección', async ({ page }) => {
		await page
			.getByRole('navigation', { name: 'Principal' })
			.getByRole('link', { name: 'Sectores' })
			.click();
		await expect(page).toHaveURL(/#sectores$/);
		await expect(
			page.getByRole('heading', { name: 'Una solución adaptada a tu profesión.' })
		).toBeInViewport();
	});

	test('las pestañas de sectores cambian el contenido, también con teclado', async ({ page }) => {
		const tabs = page.getByRole('tablist', { name: 'Profesiones' });
		await tabs.getByRole('tab', { name: 'Abogados y consultores' }).click();
		await expect(
			page.getByRole('heading', {
				name: 'Autoridad y prestigio corporativo desde el primer saludo.'
			})
		).toBeVisible();
		await expect(
			page.getByRole('region', { name: 'Perfil de ejemplo de Mariana Ortiz' })
		).toBeVisible();

		await page.keyboard.press('ArrowRight');
		await expect(tabs.getByRole('tab', { name: 'Empresas y equipos' })).toBeFocused();
		await expect(
			page.getByRole('heading', { name: 'Unifica la imagen de toda tu fuerza de ventas.' })
		).toBeVisible();
	});

	test('la demo de paleta permite elegir un color', async ({ page }) => {
		const verde = page.getByRole('radio', { name: 'Verde clínica' });
		await page.locator('label').filter({ has: verde }).click();
		await expect(verde).toBeChecked();
		await expect(page.getByRole('group', { name: 'Prueba un color: Verde clínica' })).toBeVisible();
	});

	test('las preguntas frecuentes se abren de a una', async ({ page }) => {
		const primera = page.getByText('¿Mis clientes necesitan descargar alguna aplicación', {
			exact: false
		});
		const segunda = page.getByText('¿Puedo cambiar mis fotos, propiedades, precios', {
			exact: false
		});
		const respuesta1 = page.getByText('se abre al instante en cualquier celular', { exact: false });
		const respuesta2 = page.getByText('Cuentas con un panel autoadministrable', { exact: false });

		await expect(respuesta1).toBeHidden();
		await primera.click();
		await expect(respuesta1).toBeVisible();
		await segunda.click();
		await expect(respuesta2).toBeVisible();
		await expect(respuesta1).toBeHidden();
	});
});

test.describe('Landing en móvil', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('el menú móvil se abre, navega y se cierra', async ({ page }) => {
		await page.goto('/');
		const abrir = page.getByRole('button', { name: 'Abrir menú' });
		await expect(abrir).toHaveAttribute('aria-expanded', 'false');
		await abrir.click();

		const menu = page.locator('#menu-movil');
		await expect(menu.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible();
		await menu.getByRole('link', { name: 'Planes' }).click();
		await expect(page).toHaveURL(/#planes$/);
		await expect(menu).toBeHidden();

		await page.getByRole('button', { name: 'Abrir menú' }).click();
		await page.keyboard.press('Escape');
		await expect(menu).toBeHidden();
	});

	test('no hay desplazamiento horizontal', async ({ page }) => {
		await page.goto('/');
		const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(ancho).toBeLessThanOrEqual(390);
	});
});

test.describe('Movimiento reducido', () => {
	test.use({ reducedMotion: 'reduce' });

	test('el hero no rota los perfiles por sí solo', async ({ page }) => {
		await page.goto('/');
		const hero = page.getByRole('group', { name: 'Perfiles de ejemplo' });
		await expect(
			hero.getByRole('button', { name: 'Reanudar la rotación de perfiles' })
		).toBeVisible();
	});
});
