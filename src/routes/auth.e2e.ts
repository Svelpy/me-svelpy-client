import { expect, test } from '@playwright/test';
import { CUENTAS, enviarLogin, iniciarSesion, sinImagenesExternas } from './e2e.utils';

test.beforeEach(async ({ page }) => {
	await sinImagenesExternas(page);
});

test.describe('Inicio de sesión', () => {
	test('un propietario entra directo a su tarjeta, ya cargada', async ({ page }) => {
		await iniciarSesion(page, CUENTAS.fabiola);
		await expect(page).toHaveURL(/\/panel\/mi-tarjeta$/);
		await expect(
			page.getByRole('heading', { level: 1, name: 'Dra. Fabiola Mendoza Rojas' })
		).toBeVisible();
	});

	test('el superadministrador entra al inicio del panel', async ({ page }) => {
		await iniciarSesion(page, CUENTAS.superadmin);
		await expect(page).toHaveURL(/\/panel$/);
		await expect(page.getByRole('heading', { level: 1, name: 'Inicio' })).toBeVisible();
	});

	test('con una contraseña incorrecta avisa y no entra', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await enviarLogin(page, { email: CUENTAS.fabiola.email, password: 'Otra1234' });
		await expect(page.getByText('El correo o la contraseña no son correctos.')).toBeVisible();
		await expect(page).toHaveURL(/\/auth\/sign-in/);
	});

	test('una cuenta desactivada no puede entrar', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await enviarLogin(page, CUENTAS.inactiva);
		await expect(page.getByText(/Tu cuenta está desactivada/)).toBeVisible();
		await expect(page).toHaveURL(/\/auth\/sign-in/);
	});

	test('valida el formulario antes de enviarlo', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await page.getByRole('button', { name: 'Ingresar' }).click();
		await expect(page.getByLabel('Correo')).toHaveAttribute('aria-invalid', 'true');
		await expect(page).toHaveURL(/\/auth\/sign-in/);
	});

	test('las cuentas de prueba completan el formulario', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await page
			.getByRole('region', { name: 'Cuentas de prueba' })
			.getByRole('button', { name: /fabiola@me\.test/ })
			.click();
		await expect(page.getByLabel('Correo')).toHaveValue(CUENTAS.fabiola.email);
		await expect(page.getByLabel('Contraseña', { exact: true })).toHaveValue(
			CUENTAS.fabiola.password
		);
	});
});

test.describe('Acceso a las páginas del panel', () => {
	test('una página protegida pide iniciar sesión y vuelve a ella después', async ({ page }) => {
		await page.goto('/panel/usuarios');
		await expect(page).toHaveURL(/\/auth\/sign-in\?/);
		const url = new URL(page.url());
		expect(url.searchParams.get('redirectTo')).toBe('/panel/usuarios');
		await expect(page.getByText('Inicia sesión para abrir esa página.')).toBeVisible();

		await enviarLogin(page, CUENTAS.superadmin);
		await expect(page).toHaveURL(/\/panel\/usuarios$/);
		await expect(page.getByRole('heading', { level: 1, name: 'Usuarios' })).toBeVisible();
	});

	test('si el rol no puede abrir la página pedida, va a su inicio', async ({ page }) => {
		await page.goto('/auth/sign-in?redirectTo=%2Fpanel%2Fusuarios');
		await enviarLogin(page, CUENTAS.fabiola);
		await expect(page).toHaveURL(/\/panel\/mi-tarjeta$/);
	});

	test('un propietario no puede abrir las páginas del superadministrador', async ({ page }) => {
		await iniciarSesion(page, CUENTAS.fabiola);
		for (const ruta of ['/panel', '/panel/usuarios', '/panel/tarjetas']) {
			await page.goto(ruta);
			await expect(page).toHaveURL(/\/panel\/mi-tarjeta$/);
		}
	});

	test('con sesión abierta, el login lleva directo al panel', async ({ page }) => {
		await iniciarSesion(page, CUENTAS.superadmin);
		await page.goto('/auth/sign-in');
		await expect(page).toHaveURL(/\/panel$/);
	});

	test('la sesión sigue al recargar y se cierra desde el menú de la cuenta', async ({ page }) => {
		await iniciarSesion(page, CUENTAS.fabiola);
		await page.reload();
		await expect(
			page.getByRole('heading', { level: 1, name: 'Dra. Fabiola Mendoza Rojas' })
		).toBeVisible();

		await page.getByRole('button', { name: 'Menú de tu cuenta' }).click();
		await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
		await expect(page).toHaveURL(/\/auth\/sign-in/);

		await page.goto('/panel/mi-tarjeta');
		await expect(page).toHaveURL(/\/auth\/sign-in\?/);
	});
});
