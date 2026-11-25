import { expect, test } from '@playwright/test';
import { apiFalsa, CUENTAS, TARJETA_PUBLICA } from './e2e.api';
import { iniciarSesion } from './e2e.utils';

const esOscuro = (page: import('@playwright/test').Page) =>
	page.evaluate(() => document.documentElement.classList.contains('dark'));

test.beforeEach(async ({ page }) => {
	await apiFalsa(page);
});

test.describe('Modo oscuro', () => {
	test('se elige en el login, se guarda y sigue en el panel', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await page.getByRole('radio', { name: 'Modo oscuro' }).click();
		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
		await expect(page.getByRole('radio', { name: 'Modo oscuro' })).toHaveAttribute(
			'aria-checked',
			'true'
		);

		await iniciarSesion(page, CUENTAS.superadmin);
		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
		await page.reload();
		await expect(page.locator('html')).toHaveClass(/\bdark\b/);
	});

	test('se aplica antes de que cargue la app, sin destello claro', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await page.getByRole('radio', { name: 'Modo oscuro' }).click();
		// Sin el JavaScript de la app solo corre el script de app.html
		await page.route('**/_app/**', (route) => route.abort());
		await page.reload();
		expect(await esOscuro(page)).toBe(true);
	});

	test('"Como el sistema" sigue la preferencia del dispositivo', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.goto('/auth/sign-in');
		await page.getByRole('radio', { name: 'Como el sistema' }).click();
		await expect(page.locator('html')).toHaveClass(/\bdark\b/);

		await page.emulateMedia({ colorScheme: 'light' });
		await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
	});

	test('la tarjeta pública conserva su paleta aunque el panel esté oscuro', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await page.getByRole('radio', { name: 'Modo oscuro' }).click();
		await page.goto(`/${TARJETA_PUBLICA.slug}`);
		// Fondo de la tarjeta (tema Claro del ejemplo): #FFFFFF
		await expect(page.getByTestId('tarjeta-vista')).toHaveCSS(
			'background-color',
			'rgb(255, 255, 255)'
		);
	});
});
