import { expect, test } from '@playwright/test';
import { aviso, CUENTAS, iniciarSesion, sinImagenesExternas } from '../e2e.utils';

// Cuentas de la siembra con plan propio (src/lib/mocks/seed/usuarios.seed.ts)
const PAOLA_FREE = { email: 'paola@me.test', password: 'Demo1234' };
const ANDREA_VENCE_PRONTO = { email: 'andrea@me.test', password: 'Demo1234' };

test.use({ viewport: { width: 1440, height: 900 } });

test.beforeEach(async ({ page }) => {
	await sinImagenesExternas(page);
});

test.describe('Plan Free', () => {
	test('el propietario edita todo pero publicar le pide Pro', async ({ page }) => {
		await iniciarSesion(page, PAOLA_FREE);
		await page.goto('/panel/mi-tarjeta?seccion=compartir');
		await expect(page.getByText('Publicar es parte del plan Pro')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Publicar tarjeta' })).toHaveCount(0);

		await page.goto('/panel/cuenta');
		await expect(page.getByText('Plan Free', { exact: true })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Activar Pro' })).toBeVisible();
	});

	test('el superadmin le activa Pro desde el editor y publica su tarjeta', async ({ page }) => {
		await iniciarSesion(page, CUENTAS.superadmin);
		await page.goto('/panel/tarjetas?q=paola');
		await page.getByRole('link', { name: /Paola/ }).first().click();
		await expect(page.getByText('Plan Free', { exact: true })).toBeVisible();

		await page.getByRole('button', { name: 'Activar Pro para publicar' }).click();
		const hoja = page.getByRole('dialog', { name: 'Plan de la cuenta' });
		await hoja.getByText('Pro', { exact: true }).click();
		await expect(hoja.getByLabel('Vence el')).toBeVisible();
		await hoja.getByRole('button', { name: 'Guardar plan' }).click();
		await expect(aviso(page, 'Plan Pro guardado')).toBeVisible();
		await expect(page.getByText('Plan Pro, sin vencimiento')).toBeVisible();

		await page.getByRole('button', { name: 'Publicar tarjeta' }).click();
		await expect(aviso(page, 'Tarjeta publicada')).toBeVisible();

		// En el listado de usuarios ya figura como Pro
		await page.goto('/panel/usuarios?plan=pro&q=paola');
		await expect(page.getByRole('cell', { name: 'paola@me.test', exact: true })).toBeVisible();
	});

	test('volver a Free despublica la tarjeta', async ({ page }) => {
		await iniciarSesion(page, CUENTAS.superadmin);
		await page.goto('/panel/usuarios?q=fabiola');
		await page
			.getByRole('button', { name: `Acciones para ${CUENTAS.fabiola.email}` })
			.first()
			.click();
		await page.getByRole('menuitem', { name: 'Editar cuenta' }).click();

		const hoja = page.getByRole('dialog', { name: 'Editar cuenta' });
		await hoja.getByText('Free', { exact: true }).click();
		await expect(
			hoja.getByText('Su tarjeta está publicada: al guardar vuelve a borrador.')
		).toBeVisible();
		await hoja.getByRole('button', { name: 'Guardar cambios' }).click();
		await expect(aviso(page, 'Cuenta actualizada')).toBeVisible();

		await page.goto('/doctora-fabiola');
		await expect(
			page.getByText('Esta tarjeta no existe o todavía no está publicada')
		).toBeVisible();
	});
});

test.describe('Plan Pro por vencer', () => {
	test('el propietario ve el aviso y cómo renovarlo', async ({ page }) => {
		await iniciarSesion(page, ANDREA_VENCE_PRONTO);
		await expect(page.getByText('Tu plan Pro vence en 9 días')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Renovar por WhatsApp' })).toHaveAttribute(
			'href',
			/renovar%20el%20plan%20Pro/
		);
	});
});
