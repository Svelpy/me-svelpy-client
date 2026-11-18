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
		expect(faq.mainEntity).toHaveLength(6);

		const og = await page.request.get('/images/landing/og-me-by-svelpy.png');
		expect(og.ok()).toBe(true);
	});

	test('los íconos y la imagen Open Graph existen como archivos reales', async ({
		page,
		request
	}) => {
		const rutas = [
			await page.locator('link[rel="icon"][sizes="48x48"]').getAttribute('href'),
			await page.locator('link[rel="icon"][sizes="192x192"]').getAttribute('href'),
			await page.locator('link[rel="apple-touch-icon"]').getAttribute('href'),
			'/images/landing/og-me-by-svelpy.png'
		];
		for (const ruta of rutas) {
			expect(ruta).toBeTruthy();
			const respuesta = await request.get(ruta!);
			expect(respuesta.status(), ruta!).toBe(200);
			expect(respuesta.headers()['content-type'], ruta!).toMatch(/^image\//);
		}
	});

	test('Google Analytics no se carga en localhost', async ({ page }) => {
		const pedidos: string[] = [];
		page.on('request', (r) => {
			if (r.url().includes('googletagmanager.com')) pedidos.push(r.url());
		});
		await page.reload();
		await page.waitForLoadState('networkidle');
		expect(pedidos).toEqual([]);
	});

	test('Google Analytics se carga con el ID configurado en un dominio real', async ({
		page,
		request
	}) => {
		// Se sirve el HTML prerenderizado bajo un dominio ficticio y se intercepta gtag.js.
		const html = await (await request.get('/')).text();
		await page.route('https://me.svelpy.test/**', (route) =>
			route.request().url() === 'https://me.svelpy.test/'
				? route.fulfill({ contentType: 'text/html', body: html })
				: route.abort()
		);
		const gtag = page.waitForRequest(/googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+$/);
		await page.route(/googletagmanager\.com/, (route) =>
			route.fulfill({ contentType: 'text/javascript', body: '' })
		);
		await page.goto('https://me.svelpy.test/');
		expect((await gtag).url()).toMatch(/id=G-[A-Z0-9]+$/);
		const comandos = await page.evaluate(() =>
			(window as unknown as { dataLayer: IArguments[] }).dataLayer.map((a) => a[0])
		);
		expect(comandos).toEqual(['js', 'config']);
	});

	test('muestra el titular y las llamadas a la acción del hero', async ({ page }) => {
		await expect(
			page.getByRole('heading', {
				level: 1,
				name: 'Que no solo guarden tu contacto: haz que te encuentren primero.'
			})
		).toBeVisible();
		const hero = page.locator('#inicio');
		await expect(
			hero.getByRole('link', { name: 'Ver perfiles de ejemplo', exact: true })
		).toHaveAttribute('href', '#sectores');
		// Sin etiquetas sobre los titulares.
		await expect(page.getByText('Nueva generación de identidad digital')).toHaveCount(0);
		await expect(page.getByText('Tecnología exclusiva de posicionamiento')).toHaveCount(0);
		await expect(
			page
				.getByRole('navigation', { name: 'Principal' })
				.getByRole('link', { name: 'Iniciar sesión' })
		).toHaveAttribute('href', '/auth/sign-in');
	});

	test('la acción principal tiene un solo nombre y abre WhatsApp', async ({ page }) => {
		const wa = /^https:\/\/wa\.me\/59176727537\?text=Hola%2C%20quiero%20crear%20mi%20ME\.$/;

		const solicitar = page.getByRole('link', { name: 'Solicitar mi ME por WhatsApp' });
		await expect(solicitar).toHaveCount(3); // hero, sectores y cierre
		for (const link of await solicitar.all()) {
			await expect(link).toHaveAttribute('href', wa);
			await expect(link).toHaveAttribute('target', '_blank');
			await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		}
		await expect(
			page
				.getByRole('navigation', { name: 'Principal' })
				.getByRole('link', { name: 'Solicitar mi ME' })
		).toHaveAttribute('href', wa);

		// El enlace de dudas abre WhatsApp con un mensaje de consulta.
		await expect(page.getByRole('link', { name: 'Escríbenos por WhatsApp' })).toHaveAttribute(
			'href',
			/text=Hola%2C%20tengo%20una%20consulta%20sobre%20ME\.$/
		);
		for (const link of await page
			.getByRole('link', { name: 'Ver perfiles de ejemplo', exact: true })
			.all()) {
			await expect(link).toHaveAttribute('href', '#sectores');
		}
	});

	test('no ofrece plan corporativo', async ({ page }) => {
		await expect(page.getByText(/plan corporativo/i)).toHaveCount(0);
		await expect(page.getByRole('tab', { name: 'Empresas y equipos' })).toHaveCount(0);
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
		await expect(tabs.getByRole('tab', { name: 'Cualquier profesión' })).toBeFocused();
		await expect(
			page.getByRole('heading', {
				name: 'Sea cual sea tu rubro, tu ME se adapta a lo que haces.'
			})
		).toBeVisible();
		await expect(
			page.getByRole('region', { name: 'Perfil de ejemplo de Andrés Quiroga' })
		).toBeVisible();

		// Desde la última pestaña, la flecha derecha vuelve a la primera.
		await page.keyboard.press('ArrowRight');
		await expect(tabs.getByRole('tab', { name: 'Agentes inmobiliarios' })).toBeFocused();
	});

	test('la demo de temas muestra los 5 presets y aplica el elegido', async ({ page }) => {
		const temas = page.getByRole('group', { name: /^Tema inicial:/ });
		for (const nombre of ['Claro', 'Oscuro', 'Elegante', 'Salud', 'Corporativo']) {
			await expect(temas.getByRole('radio', { name: nombre })).toHaveCount(1);
		}
		const oscuro = page.getByRole('radio', { name: 'Oscuro' });
		await page.locator('label').filter({ has: oscuro }).click();
		await expect(oscuro).toBeChecked();
		await expect(page.getByTestId('palette-preview')).toHaveAttribute('data-preset', 'oscuro');
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
		await menu.getByRole('link', { name: 'Contacto' }).click();
		await expect(page).toHaveURL(/#contacto$/);
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
