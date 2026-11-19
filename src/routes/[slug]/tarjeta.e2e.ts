import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { sinImagenesExternas } from '../e2e.utils';

test.beforeEach(async ({ page }) => {
	await sinImagenesExternas(page);
});

test.describe('Tarjeta pública', () => {
	test('cualquiera la ve, de solo lectura, con su propio SEO', async ({ page }) => {
		await page.goto('/doctora-fabiola');
		await expect(
			page.getByRole('heading', { level: 1, name: 'Dra. Fabiola Mendoza Rojas' })
		).toBeVisible();
		await expect(page).toHaveTitle(/^Dra\. Fabiola Mendoza Rojas \| Pediatra y neonatóloga/);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			'content',
			/^Dra\. Fabiola Mendoza Rojas, Pediatra y neonatóloga/
		);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			/\/doctora-fabiola$/
		);
		await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'profile');
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			/^https:\/\//
		);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow');
		// Nada editable para quien la visita
		await expect(page.getByRole('textbox')).toHaveCount(0);
	});

	test('expone sus datos para buscadores e IAs (GEO) en JSON-LD', async ({ page }) => {
		await page.goto('/doctora-fabiola');
		const jsonLd = JSON.parse(
			(await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}'
		);
		const nodos: { '@type': string; [clave: string]: unknown }[] = jsonLd['@graph'];
		expect(nodos.map((n) => n['@type'])).toEqual(['Person', 'Physician', 'FAQPage']);

		const persona = nodos.find((n) => n['@type'] === 'Person')!;
		expect(persona.name).toBe('Dra. Fabiola Mendoza Rojas');
		expect(persona.jobTitle).toBe('Pediatra y neonatóloga');

		const consultorio = nodos.find((n) => n['@type'] === 'Physician')!;
		expect(consultorio).toHaveProperty('geo');
		expect(consultorio).toHaveProperty('openingHoursSpecification');

		const faq = nodos.find((n) => n['@type'] === 'FAQPage')!;
		expect(faq.mainEntity).toHaveLength(3);
	});

	test('muestra las secciones visibles en su orden', async ({ page }) => {
		await page.goto('/doctora-fabiola');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		const titulos = await page.getByTestId('tarjeta-vista').locator('section h2').allTextContents();
		expect(titulos).toEqual([
			'Accesos rápidos',
			'Acerca de mí',
			'Consultas y servicios',
			'Ubicación y horarios',
			'Contacto',
			'Redes',
			'Formación',
			'Certificaciones',
			'Preguntas frecuentes'
		]);
	});

	test('guarda el contacto en un .vcf con sus datos', async ({ page }) => {
		await page.goto('/doctora-fabiola');
		const descarga = page.waitForEvent('download');
		await page.getByRole('button', { name: /Guardar contacto/ }).click();
		const archivo = await descarga;
		expect(archivo.suggestedFilename()).toBe('doctora-fabiola.vcf');

		const vcf = await readFile(await archivo.path(), 'utf8');
		expect(vcf).toMatch(/^BEGIN:VCARD\r?\nVERSION:3\.0/);
		expect(vcf).toContain('FN:Dra. Fabiola Mendoza Rojas');
		expect(vcf).toContain('TEL;TYPE=CELL,VOICE,PREF:+59170012345');
		expect(vcf).toContain('EMAIL;TYPE=INTERNET,PREF:citas@pediatriacrecer.test');
		expect(vcf).toMatch(/URL:https?:\/\/[^\r\n]+\/doctora-fabiola/);
		expect(vcf.trimEnd()).toMatch(/END:VCARD$/);
	});

	test('una dirección que no existe muestra una página amable', async ({ page }) => {
		await page.goto('/esta-tarjeta-no-existe');
		await expect(
			page.getByRole('heading', { name: 'Esta tarjeta no existe o todavía no está publicada' })
		).toBeVisible();
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
	});

	test('una tarjeta en borrador no se ve en público', async ({ page }) => {
		await page.goto('/paola-estilista');
		await expect(
			page.getByRole('heading', { name: 'Esta tarjeta no existe o todavía no está publicada' })
		).toBeVisible();
	});

	test('en el celular no hay desplazamiento horizontal', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		for (const slug of ['doctora-fabiola', 'chef-rodrigo-paz', 'lucia-fernandez-foto']) {
			await page.goto(`/${slug}`);
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
			const desborde = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			expect(desborde, slug).toBeLessThanOrEqual(0);
		}
	});
});
