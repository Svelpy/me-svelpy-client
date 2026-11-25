import { expect, test } from '@playwright/test';
import { apiFalsa, CUENTAS } from './e2e.api';
import { aviso, enviarLogin, iniciarSesion } from './e2e.utils';

const ANA = 'Dra. Ana María Pérez Quispe';

test.describe('Inicio de sesión', () => {
	test('un user entra directo a su tarjeta, ya cargada con una sola petición', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.ana);
		await expect(page).toHaveURL(/\/panel\/mi-tarjeta$/);
		await expect(page.getByRole('heading', { level: 1, name: ANA })).toBeVisible();
		// El login manda JSON y la tarjeta llega con /usuarios/me
		expect(api.llamadasA('POST', '/auth/login')[0].cuerpo).toEqual({
			email: CUENTAS.ana.email,
			password: CUENTAS.ana.password
		});
		expect(api.llamadasA('GET', /^\/tarjetas\//)).toHaveLength(0);
	});

	test('admin y superadmin entran al inicio del panel', async ({ page }) => {
		await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.admin);
		await expect(page).toHaveURL(/\/panel$/);
		await expect(page.getByRole('heading', { level: 1, name: 'Inicio' })).toBeVisible();
	});

	test('con una contraseña incorrecta avisa y no entra', async ({ page }) => {
		await apiFalsa(page);
		await page.goto('/auth/sign-in');
		await enviarLogin(page, { email: CUENTAS.ana.email, password: 'Otra1234' });
		await expect(page.getByText('El correo o la contraseña no son correctos.')).toBeVisible();
		await expect(page).toHaveURL(/\/auth\/sign-in/);
	});

	test('una cuenta dada de baja no puede entrar', async ({ page }) => {
		await apiFalsa(page);
		await page.goto('/auth/sign-in');
		await enviarLogin(page, CUENTAS.baja);
		await expect(page.getByText('Esta cuenta está dada de baja.')).toBeVisible();
		await expect(page).toHaveURL(/\/auth\/sign-in/);
	});

	test('valida el formulario antes de enviarlo', async ({ page }) => {
		const api = await apiFalsa(page);
		await page.goto('/auth/sign-in');
		await page.getByRole('button', { name: 'Ingresar' }).click();
		await expect(page.getByLabel('Correo')).toHaveAttribute('aria-invalid', 'true');
		expect(api.llamadasA('POST', '/auth/login')).toHaveLength(0);
	});
});

test.describe('Acceso a las páginas del panel', () => {
	test('una página protegida pide iniciar sesión y vuelve a ella después', async ({ page }) => {
		await apiFalsa(page);
		await page.goto('/panel/usuarios');
		await expect(page).toHaveURL(/\/auth\/sign-in\?/);
		expect(new URL(page.url()).searchParams.get('redirectTo')).toBe('/panel/usuarios');
		await expect(page.getByText('Inicia sesión para abrir esa página.')).toBeVisible();

		await enviarLogin(page, CUENTAS.superadmin);
		await expect(page).toHaveURL(/\/panel\/usuarios$/);
		await expect(page.getByRole('heading', { level: 1, name: 'Usuarios' })).toBeVisible();
	});

	test('si el rol no puede abrir la página pedida, va a su inicio', async ({ page }) => {
		await apiFalsa(page);
		await page.goto('/auth/sign-in?redirectTo=%2Fpanel%2Fusuarios');
		await enviarLogin(page, CUENTAS.ana);
		await expect(page).toHaveURL(/\/panel\/mi-tarjeta$/);
	});

	test('un user no abre las páginas de administración', async ({ page }) => {
		await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.ana);
		for (const ruta of ['/panel', '/panel/usuarios', '/panel/tarjetas', '/panel/pagos']) {
			await page.goto(ruta);
			await expect(page).toHaveURL(/\/panel\/mi-tarjeta$/);
		}
	});

	test('con sesión abierta, el login lleva directo al panel', async ({ page }) => {
		await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.superadmin);
		await page.goto('/auth/sign-in');
		await expect(page).toHaveURL(/\/panel$/);
	});

	test('la sesión sigue al recargar y se cierra desde el menú de la cuenta', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.ana);
		await page.reload();
		await expect(page.getByRole('heading', { level: 1, name: ANA })).toBeVisible();

		await page.getByRole('button', { name: 'Menú de tu cuenta' }).click();
		await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
		await expect(page).toHaveURL(/\/auth\/sign-in/);
		expect(api.llamadasA('POST', '/auth/logout')).toHaveLength(1);

		await page.goto('/panel/mi-tarjeta');
		await expect(page).toHaveURL(/\/auth\/sign-in\?/);
	});
});

test.describe('Contraseña olvidada', () => {
	test('pide el enlace con el correo ya escrito y responde igual exista o no', async ({ page }) => {
		const api = await apiFalsa(page);
		await page.goto('/auth/sign-in');
		await page.getByLabel('Correo').fill('quien@me.test');
		await page.getByRole('link', { name: 'Te enviamos un enlace' }).click();

		await expect(
			page.getByRole('heading', { level: 1, name: 'Recupera tu contraseña' })
		).toBeVisible();
		await expect(page.getByLabel('Correo')).toHaveValue('quien@me.test');
		await page.getByRole('button', { name: 'Enviar enlace' }).click();

		await expect(page.getByRole('heading', { level: 1, name: 'Revisa tu correo' })).toBeVisible();
		await expect(page.getByText('quien@me.test')).toBeVisible();
		await expect(page.getByRole('button', { name: /Enviar otra vez en \d+ s/ })).toBeDisabled();
		expect(api.llamadasA('POST', '/auth/forgot-password')[0].cuerpo).toEqual({
			email: 'quien@me.test'
		});
	});

	test('crea la contraseña nueva con el enlace del correo y vuelve al login', async ({ page }) => {
		const api = await apiFalsa(page);
		await page.goto('/auth/reset-password?token=valido');
		await page.getByLabel('Contraseña nueva').fill('Nueva1234');
		await page.getByLabel('Repite la contraseña').fill('Nueva1234');
		await page.getByRole('button', { name: 'Guardar contraseña' }).click();

		await expect(page).toHaveURL(/\/auth\/sign-in\?motivo=password/);
		await expect(page.getByText('Tu contraseña cambió. Ingresa con la nueva.')).toBeVisible();
		expect(api.llamadasA('POST', '/auth/reset-password')[0].cuerpo).toEqual({
			token: 'valido',
			new_password: 'Nueva1234'
		});
	});

	test('un enlace vencido lo explica y ofrece pedir otro', async ({ page }) => {
		await apiFalsa(page);
		await page.goto('/auth/reset-password?token=viejo');
		await page.getByLabel('Contraseña nueva').fill('Nueva1234');
		await page.getByLabel('Repite la contraseña').fill('Nueva1234');
		await page.getByRole('button', { name: 'Guardar contraseña' }).click();
		await expect(page.getByText('El enlace venció o ya se usó.')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Pedir otro' })).toBeVisible();
	});

	test('sin token no muestra el formulario', async ({ page }) => {
		await apiFalsa(page);
		await page.goto('/auth/reset-password');
		await expect(
			page.getByRole('heading', { level: 1, name: 'Este enlace no está completo' })
		).toBeVisible();
		await expect(page.getByRole('link', { name: 'Pedir un enlace nuevo' })).toBeVisible();
	});
});

test.describe('Verificación del correo', () => {
	test('con sesión abierta verifica, actualiza la sesión y quita el aviso', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.nuevo);
		await expect(page.getByText(/Verifica tu correo para poder publicar/)).toBeVisible();

		await page.goto('/auth/verify-email?token=valido');
		await expect(
			page.getByRole('heading', { level: 1, name: 'Tu correo quedó verificado' })
		).toBeVisible();
		// Es Free: le queda activar Pro para publicar
		await expect(page.getByText(/Te queda un paso para publicar/)).toBeVisible();
		await page.getByRole('link', { name: 'Ir a mi tarjeta' }).click();
		await expect(page).toHaveURL(/\/panel\/mi-tarjeta$/);
		await expect(page.getByText(/Verifica tu correo para poder publicar/)).toHaveCount(0);
		expect(api.llamadasA('POST', '/auth/verify-email')[0].cuerpo).toEqual({ token: 'valido' });
	});

	test('un enlace usado ofrece enviar uno nuevo', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.nuevo);
		await page.goto('/auth/verify-email?token=usado');
		await expect(
			page.getByRole('heading', { level: 1, name: 'No pudimos verificar tu correo' })
		).toBeVisible();
		await page.getByRole('button', { name: 'Enviar un enlace nuevo' }).click();
		await expect(aviso(page, `Enlace enviado a ${CUENTAS.nuevo.email}`)).toBeVisible();
		expect(api.llamadasA('POST', '/auth/resend-verification')).toHaveLength(1);
	});
});
