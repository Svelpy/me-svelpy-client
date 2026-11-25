import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { apiFalsa, TARJETA_PUBLICA } from '../e2e.api';

// La tarjeta del ejemplo del OpenAPI la sirve tests/apiPublica.mjs (se arma en el servidor)
const SLUG = TARJETA_PUBLICA.slug;
const NOMBRE = 'Dra. Ana María Pérez Quispe';

test.beforeEach(async ({ page }) => {
	// Las fotos de Cloudinary y cualquier llamada del navegador, sin red
	await apiFalsa(page);
});

test.describe('Tarjeta pública', () => {
	test('el HTML del servidor ya trae el SEO y los datos estructurados', async ({ request }) => {
		const respuesta = await request.get(`/${SLUG}`);
		expect(respuesta.status()).toBe(200);
		const html = await respuesta.text();
		expect(html).toContain('<title>Dra. Ana Pérez · Pediatra en La Paz</title>');
		expect(html).toContain('application/ld+json');
		expect(html).toContain(NOMBRE);
		expect(html).toMatch(/<meta property="og:image" content="https:\/\/res\.cloudinary\.com/);
	});

	test('cualquiera la ve, de solo lectura, con su propio SEO', async ({ page }) => {
		await page.goto(`/${SLUG}`);
		await expect(page.getByRole('heading', { level: 1, name: NOMBRE })).toBeVisible();
		await expect(page).toHaveTitle('Dra. Ana Pérez · Pediatra en La Paz');
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			'Consultas pediátricas, controles de crecimiento y vacunación en La Paz.'
		);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			new RegExp(`/${SLUG}$`)
		);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
		await expect(page.getByRole('textbox')).toHaveCount(0);
	});

	test('expone sus datos para buscadores e IAs (GEO) en JSON-LD', async ({ page }) => {
		await page.goto(`/${SLUG}`);
		const jsonLd = JSON.parse(
			(await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}'
		);
		const nodos: { '@type': string; [clave: string]: unknown }[] = jsonLd['@graph'];
		expect(nodos.map((n) => n['@type'])).toEqual(['Person', 'Physician', 'FAQPage']);
		const persona = nodos.find((n) => n['@type'] === 'Person')!;
		expect(persona.name).toBe(NOMBRE);
		const consultorio = nodos.find((n) => n['@type'] === 'Physician')!;
		expect(consultorio).toHaveProperty('geo');
		expect(consultorio).toHaveProperty('openingHoursSpecification');
		expect(nodos.find((n) => n['@type'] === 'FAQPage')!.mainEntity).toHaveLength(3);
	});

	test('muestra las secciones visibles en su orden, con sus títulos propios', async ({ page }) => {
		await page.goto(`/${SLUG}`);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		const titulos = await page.getByTestId('tarjeta-vista').locator('section h2').allTextContents();
		expect(titulos.map((t) => t.trim())).toEqual([
			'Sobre mí',
			'Contáctame',
			'Servicios',
			'Dónde atiendo',
			'Sígueme',
			'Formación',
			'Preguntas frecuentes'
		]);
		// El QR de pago se ofrece en Contacto
		await page.getByRole('button', { name: 'Pagar con QR' }).click();
		await expect(page.getByRole('img', { name: /QR de pago de/ })).toBeVisible();
	});

	test('guarda el contacto en un .vcf con sus datos', async ({ page }) => {
		await page.goto(`/${SLUG}`);
		const descarga = page.waitForEvent('download');
		await page.getByRole('button', { name: /Guardar contacto/ }).click();
		const archivo = await descarga;
		expect(archivo.suggestedFilename()).toBe(`${SLUG}.vcf`);

		const vcf = await readFile(await archivo.path(), 'utf8');
		expect(vcf).toMatch(/^BEGIN:VCARD\r?\nVERSION:3\.0/);
		expect(vcf).toContain(`FN:${NOMBRE}`);
		expect(vcf).toContain('TEL;TYPE=CELL,VOICE,PREF:+59170000001');
		expect(vcf).toContain('EMAIL;TYPE=INTERNET,PREF:consultas@draanaperez.com');
		expect(vcf.trimEnd()).toMatch(/END:VCARD$/);
	});

	test('una dirección que no existe muestra una página amable (404)', async ({ page }) => {
		const respuesta = await page.goto('/esta-tarjeta-no-existe');
		expect(respuesta?.status()).toBe(404);
		await expect(
			page.getByRole('heading', { name: 'Esta tarjeta no existe o todavía no está publicada' })
		).toBeVisible();
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
	});

	test('el QR (/t/{id}) lleva al enlace actual de la tarjeta', async ({ page }) => {
		await page.goto(`/t/${TARJETA_PUBLICA.id}`);
		await expect(page).toHaveURL(new RegExp(`/${SLUG}$`));
		await expect(page.getByRole('heading', { level: 1, name: NOMBRE })).toBeVisible();
	});

	test('un QR de una tarjeta que ya no está publicada muestra la misma página amable', async ({
		page
	}) => {
		await page.goto('/t/00000000-0000-4000-8000-000000000000');
		await expect(
			page.getByRole('heading', { name: 'Esta tarjeta no existe o todavía no está publicada' })
		).toBeVisible();
	});

	test('en el celular no hay desplazamiento horizontal', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(`/${SLUG}`);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		const desborde = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		);
		expect(desborde).toBeLessThanOrEqual(0);
	});
});
