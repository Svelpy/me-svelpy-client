import { expect, test } from '@playwright/test';

// La landing es estática (prerenderizada) y no consulta el backend: no hace falta mockear la API.

test.describe('Landing ME by Svelpy', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('expone los metadatos de SEO, Open Graph y JSON-LD', async ({ page }) => {
		await expect(page).toHaveTitle('ME | Tarjeta digital profesional');
		await expect(page.locator('html')).toHaveAttribute('lang', 'es');
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			/Crea gratis tu tarjeta digital profesional/
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
		expect(faq.mainEntity).toHaveLength(5);

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

	test('muestra el titular y el acceso para iniciar sesión', async ({ page }) => {
		await expect(
			page.getByRole('heading', {
				level: 1,
				name: 'Que no solo guarden tu contacto: haz que te encuentren primero.'
			})
		).toBeVisible();
		await expect(
			page
				.getByRole('navigation', { name: 'Principal' })
				.getByRole('link', { name: 'Iniciar sesión' })
		).toHaveAttribute('href', '/auth/sign-in');
	});

	test('el enlace escrito en el hero lleva al registro ya completo', async ({ page }) => {
		const hero = page.locator('#inicio');
		const enlace = hero.getByRole('textbox', { name: 'Tu enlace' });
		await enlace.fill('Dra. Fabiola Pérez');
		await expect(enlace).toHaveValue('dra-fabiola-perez');
		await hero.getByRole('button', { name: 'Crear ME gratis' }).click();

		await expect(page).toHaveURL(/\/auth\/sign-up\?enlace=dra-fabiola-perez$/);
		await expect(page.getByLabel(/^Tu enlace/)).toHaveValue('dra-fabiola-perez');
	});

	test('crear gratis lleva al registro desde el menú y desde las secciones', async ({ page }) => {
		await expect(
			page
				.getByRole('navigation', { name: 'Principal' })
				.getByRole('link', { name: 'Crear ME gratis' })
		).toHaveAttribute('href', '/auth/sign-up');
		const enlaces = page.locator('main').getByRole('link', { name: 'Crear ME gratis' });
		await expect(enlaces).toHaveCount(2); // funciones y «Créala tú»
		for (const link of await enlaces.all()) {
			await expect(link).toHaveAttribute('href', '/auth/sign-up');
		}
		// Hero y cierre lo ofrecen como formulario con el enlace.
		await expect(page.getByRole('button', { name: 'Crear ME gratis' })).toHaveCount(2);
	});

	test('solicitar por WhatsApp tiene un solo nombre y abre WhatsApp', async ({ page }) => {
		const wa =
			/^https:\/\/wa\.me\/59176727537\?text=Hola%2C%20quiero%20que%20me%20armen%20mi%20ME\.$/;

		const solicitar = page.getByRole('link', { name: 'Solicitar ME por WhatsApp' });
		await expect(solicitar).toHaveCount(3); // hero, «Te la armamos» y cierre
		for (const link of await solicitar.all()) {
			await expect(link).toHaveAttribute('href', wa);
			await expect(link).toHaveAttribute('target', '_blank');
			await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		}

		// El enlace de dudas abre WhatsApp con un mensaje de consulta.
		await expect(page.getByRole('link', { name: 'Escríbenos por WhatsApp' })).toHaveAttribute(
			'href',
			/text=Hola%2C%20tengo%20una%20consulta%20sobre%20ME\.$/
		);
	});

	test('las dos formas de empezar explican el plan', async ({ page }) => {
		const crear = page.getByRole('article', { name: 'Créala tú' });
		await expect(crear.getByText('Publícala con el plan Pro y compártela.')).toBeVisible();
		const armar = page.getByRole('article', { name: 'Te la armamos' });
		await expect(armar.getByText('Lista para compartir en 24 horas.')).toBeVisible();
	});

	test('no ofrece plan corporativo', async ({ page }) => {
		await expect(page.getByText(/plan corporativo/i)).toHaveCount(0);
	});

	test('el carrusel del hero rota los perfiles solo, sin pestañas ni pausa', async ({ page }) => {
		const hero = page.getByRole('group', { name: 'Perfiles de ejemplo' });
		const url = hero.getByTestId('phone-url');
		await expect(url).toHaveText('me.svelpy.com/valeria-rojas');
		await expect(hero.getByRole('tab')).toHaveCount(0);
		await expect(hero.getByRole('button')).toHaveCount(0);

		// Pasa al siguiente perfil por sí solo, con su tarjeta física.
		await expect(url).toHaveText('me.svelpy.com/dra-camila-rivas', { timeout: 7000 });
		await expect(
			hero.getByRole('img', { name: /Tarjeta física ME de Dra\. Camila Rivas/ })
		).toBeVisible();
	});

	test('el carrusel se detiene mientras el puntero está encima', async ({ page }) => {
		const hero = page.getByRole('group', { name: 'Perfiles de ejemplo' });
		const url = hero.getByTestId('phone-url');
		await hero.hover();
		await page.waitForTimeout(5500);
		await expect(url).toHaveText('me.svelpy.com/valeria-rojas');
	});

	test('los enlaces del menú llevan a su sección', async ({ page }) => {
		await page
			.getByRole('navigation', { name: 'Principal' })
			.getByRole('link', { name: 'Cómo empezar' })
			.click();
		await expect(page).toHaveURL(/#empezar$/);
		await expect(
			page.getByRole('heading', { name: 'Dos formas de tener tu ME.' })
		).toBeInViewport();
	});

	test('la demo de temas muestra los 10 presets y aplica el elegido', async ({ page }) => {
		const temas = page.getByRole('group', { name: /^Tema seleccionado:/ });
		await expect(temas.getByRole('radio')).toHaveCount(10);
		const oscuro = page.getByRole('radio', { name: 'Oscuro' });
		await page.locator('label').filter({ has: oscuro }).click();
		await expect(oscuro).toBeChecked();
		await expect(page.getByTestId('palette-preview')).toHaveAttribute('data-preset', 'oscuro');
	});

	test('SEO + GEO muestra los dos ejemplos y aclara que son ilustrativos', async ({ page }) => {
		const seccion = page.locator('#seo-geo');
		await expect(
			seccion.getByRole('heading', {
				level: 2,
				name: 'Haz que tu perfil sea más fácil de encontrar en Google y en la era de la IA.'
			})
		).toBeVisible();
		await expect(seccion.getByRole('figure')).toHaveCount(2);
		await expect(
			seccion.getByText('odontóloga estética cerca de mí', { exact: true })
		).toBeVisible();
		await expect(
			seccion.getByText('¿Qué odontóloga me recomiendas para un diseño de sonrisa?')
		).toBeVisible();
		await expect(seccion.getByText(/^Ejemplos ilustrativos\./)).toBeVisible();
	});

	test('las preguntas frecuentes se abren de a una', async ({ page }) => {
		const primera = page.getByText('¿Mis clientes necesitan instalar algo?', {
			exact: false
		});
		const segunda = page.getByText('¿Puedo cambiar mis datos después?', {
			exact: false
		});
		const respuesta1 = page.getByText('se abre en el navegador de cualquier celular', {
			exact: false
		});
		const respuesta2 = page.getByText('Tu enlace y tu QR siguen siendo los mismos', {
			exact: false
		});

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
		await expect(menu.getByRole('link', { name: 'Solicitar ME por WhatsApp' })).toBeVisible();
		await menu.getByRole('link', { name: 'Preguntas' }).click();
		await expect(page).toHaveURL(/#preguntas$/);
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

	test('el carrusel sigue rotando, sin fundido', async ({ page }) => {
		await page.goto('/');
		const hero = page.getByRole('group', { name: 'Perfiles de ejemplo' });
		await expect(hero.getByTestId('phone-url')).toHaveText('me.svelpy.com/dra-camila-rivas', {
			timeout: 7000
		});
		await expect(hero.locator('.duration-500').first()).toHaveCSS('transition-property', 'none');
	});
});
