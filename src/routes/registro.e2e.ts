import { expect, test, type Page } from '@playwright/test';
import { CUENTAS, sinImagenesExternas } from './e2e.utils';

// Escritorio: además del formulario se ve la tarjeta que se arma
test.use({ viewport: { width: 1440, height: 900 } });

test.beforeEach(async ({ page }) => {
	await sinImagenesExternas(page);
});

const titulo = (page: Page, nombre: string) =>
	page.getByRole('heading', { level: 1, name: nombre });
const continuar = (page: Page) => page.getByRole('button', { name: 'Continuar' });

/** Paso 2: correo y contraseña */
async function completarAcceso(page: Page, email: string) {
	await expect(titulo(page, 'Crea tu acceso')).toBeFocused();
	await page.getByLabel(/^Correo/).fill(email);
	await page.getByLabel(/^Contraseña/).fill('Clave1234');
	await continuar(page).click();
}

test.describe('Registro propio', () => {
	test('elige su enlace, crea su acceso y llega al editor con el plan Free', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await page.getByRole('link', { name: 'Crea tu tarjeta' }).click();

		// Paso 1: el enlace, con el dominio pegado y la revisión en vivo
		await expect(titulo(page, 'Elige tu enlace')).toBeVisible();
		await expect(page.getByText('Paso 1 de 3')).toBeVisible();
		const enlace = page.getByLabel(/^Tu enlace/);
		await enlace.fill('Rocío Suárez');
		await expect(enlace).toHaveValue('rocio-suarez');
		await expect(page.getByText('Está libre: me.svelpy.com/rocio-suarez')).toBeVisible();
		await continuar(page).click();

		await completarAcceso(page, 'rocio@me.test');

		// Paso 3: sus datos; la tarjeta de la derecha se arma mientras escribe
		await expect(titulo(page, 'Cuéntanos de ti')).toBeFocused();
		await page.getByLabel(/^Nombres/).fill('Rocío');
		await page.getByLabel('Apellidos').fill('Suárez');
		await page.getByRole('combobox', { name: /^Rubro/ }).fill('Nutrición');
		const vista = page.getByRole('complementary', { name: 'Tu tarjeta mientras la armas' });
		await expect(vista.getByText('Rocío Suárez')).toBeVisible();
		await expect(vista.getByText('me.svelpy.com/rocio-suarez')).toBeVisible();
		await page.getByRole('button', { name: 'Crear mi tarjeta' }).click();

		await expect(page).toHaveURL(/\/panel\/mi-tarjeta/);
		await expect(titulo(page, 'Rocío Suárez')).toBeVisible();
		await expect(page.getByText('Plan Free', { exact: true })).toBeVisible();
		// Sin Pro, la acción principal lleva a activarlo por WhatsApp
		const activar = page.getByRole('link', { name: 'Activar Pro para publicar' }).first();
		await expect(activar).toHaveAttribute('href', /^https:\/\/wa\.me\/59176727537\?text=/);
		await expect(page.getByRole('button', { name: 'Publicar tarjeta' })).toHaveCount(0);
	});

	test('un enlace tomado no deja seguir y ofrece otro con un clic', async ({ page }) => {
		await page.goto('/auth/sign-up?enlace=doctora-fabiola');
		const enlace = page.getByLabel(/^Tu enlace/);
		await expect(enlace).toHaveValue('doctora-fabiola');
		await expect(page.getByText('Ese enlace ya está en uso.')).toBeVisible();

		await continuar(page).click();
		await expect(titulo(page, 'Elige tu enlace')).toBeVisible();

		await page.getByRole('button', { name: 'Usar doctora-fabiola-2' }).click();
		await expect(enlace).toHaveValue('doctora-fabiola-2');
		await expect(page.getByText('Está libre: me.svelpy.com/doctora-fabiola-2')).toBeVisible();
		await continuar(page).click();
		await expect(titulo(page, 'Crea tu acceso')).toBeVisible();
	});

	test('acepta un rubro propio que no está en la lista', async ({ page }) => {
		await page.goto('/auth/sign-up?enlace=mateo-apicola');
		await expect(page.getByText('Está libre: me.svelpy.com/mateo-apicola')).toBeVisible();
		await continuar(page).click();
		await completarAcceso(page, 'mateo@me.test');

		await page.getByLabel(/^Nombres/).fill('Mateo');
		await page.getByLabel('Apellidos').fill('Vaca Díez');
		await page.getByRole('combobox', { name: /^Rubro/ }).fill('Apicultura orgánica');
		await page.getByRole('option', { name: /Usar «Apicultura orgánica»/ }).click();
		await expect(page.getByRole('combobox', { name: /^Rubro/ })).toHaveValue('Apicultura orgánica');
		await page.getByRole('button', { name: 'Crear mi tarjeta' }).click();

		await expect(titulo(page, 'Mateo Vaca Díez')).toBeVisible();
		// El editor abre en Perfil, con su rubro propio
		await expect(page.getByRole('combobox', { name: /^Rubro/ })).toHaveValue('Apicultura orgánica');
	});

	test('si el correo ya tiene cuenta, vuelve al paso del acceso', async ({ page }) => {
		await page.goto('/auth/sign-up?enlace=fabiola-otra');
		await expect(page.getByText('Está libre: me.svelpy.com/fabiola-otra')).toBeVisible();
		await continuar(page).click();
		await completarAcceso(page, CUENTAS.fabiola.email);

		await page.getByLabel(/^Nombres/).fill('Fabiola');
		await page.getByRole('combobox', { name: /^Rubro/ }).fill('Pediatría');
		await page.getByRole('button', { name: 'Crear mi tarjeta' }).click();

		await expect(titulo(page, 'Crea tu acceso')).toBeVisible();
		await expect(
			page.getByText('Ya existe una cuenta con ese correo. Inicia sesión.')
		).toBeVisible();
	});

	test('Atrás conserva lo escrito', async ({ page }) => {
		await page.goto('/auth/sign-up?enlace=lucas-perez');
		await expect(page.getByText('Está libre: me.svelpy.com/lucas-perez')).toBeVisible();
		await continuar(page).click();
		await page.getByLabel(/^Correo/).fill('lucas@me.test');
		await page.getByRole('button', { name: 'Atrás' }).click();
		await expect(page.getByLabel(/^Tu enlace/)).toHaveValue('lucas-perez');
		await continuar(page).click();
		await expect(page.getByLabel(/^Correo/)).toHaveValue('lucas@me.test');
	});
});
