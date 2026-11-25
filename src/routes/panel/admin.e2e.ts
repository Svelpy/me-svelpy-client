import { expect, test, type Page } from '@playwright/test';
import { apiFalsa, CUENTAS, TARJETA_PUBLICA } from '../e2e.api';
import { aviso, iniciarSesion } from '../e2e.utils';

test.use({ viewport: { width: 1440, height: 900 } });

/** Abre el menú ⋮ de una cuenta en la tabla de usuarios */
async function menuDe(page: Page, email: string) {
	await page.goto('/panel/usuarios');
	await page
		.getByRole('button', { name: `Acciones para ${email}` })
		.first()
		.click();
	return page.getByRole('menu');
}

test.describe('Admin: todo menos eliminar', () => {
	test('gestiona cuentas user pero no ve "Eliminar"', async ({ page }) => {
		await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.admin);
		const menu = await menuDe(page, CUENTAS.nuevo.email);
		await expect(menu.getByRole('menuitem', { name: 'Editar cuenta' })).toBeVisible();
		await expect(menu.getByRole('menuitem', { name: 'Registrar pago' })).toBeVisible();
		await expect(menu.getByRole('menuitem', { name: 'Dar de baja' })).toBeVisible();
		await expect(menu.getByRole('menuitem', { name: 'Eliminar cuenta' })).toHaveCount(0);
	});

	test('no gestiona cuentas de su mismo rango o superior', async ({ page }) => {
		await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.admin);
		const menu = await menuDe(page, CUENTAS.superadmin.email);
		await expect(menu.getByRole('menuitem', { name: 'Ver cuenta' })).toBeVisible();
		await expect(menu.getByRole('menuitem', { name: 'Editar cuenta' })).toHaveCount(0);
	});

	test('edita una tarjeta ajena (y su enlace) pero no la elimina', async ({ page }) => {
		await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.admin);
		await page.goto(`/panel/tarjetas/${TARJETA_PUBLICA.id}`);
		await expect(
			page.getByRole('heading', { level: 1, name: 'Dra. Ana María Pérez Quispe' })
		).toBeVisible();
		await expect(page.getByText(`Cuenta: ${CUENTAS.ana.email}`)).toBeVisible();
		await expect(page.getByRole('textbox', { name: /^Enlace de la tarjeta/ })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Eliminar tarjeta' })).toHaveCount(0);
	});

	test('una cuenta Free muestra cómo publicar: registrar un pago', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.admin);
		const tarjeta = api.porEmail(CUENTAS.nuevo.email)!.tarjeta!;
		await page.goto(`/panel/tarjetas/${tarjeta.id}`);
		await expect(page.getByText('Esta cuenta tiene el plan Free')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Publicar tarjeta' })).toBeDisabled();
		await page.getByRole('link', { name: 'Registrar pago' }).first().click();
		await expect(page).toHaveURL(/\/panel\/pagos\/nuevo\?usuario=/);
	});
});

test.describe('Superadmin', () => {
	test('elimina una tarjeta con confirmación', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.superadmin);
		await page.goto(`/panel/tarjetas/${TARJETA_PUBLICA.id}`);
		await page.getByRole('button', { name: 'Eliminar tarjeta' }).click();
		await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar tarjeta' }).click();
		await expect(aviso(page, 'Tarjeta eliminada')).toBeVisible();
		await expect(page).toHaveURL(/\/panel\/tarjetas$/);
		expect(api.llamadasA('DELETE', `/tarjetas/${TARJETA_PUBLICA.id}`)).toHaveLength(1);
	});

	test('una cuenta con tarjeta no se elimina: se ofrece darla de baja', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.superadmin);
		const menu = await menuDe(page, CUENTAS.nuevo.email);
		await menu.getByRole('menuitem', { name: 'Eliminar cuenta' }).click();
		await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar cuenta' }).click();

		const baja = page.getByRole('alertdialog');
		await expect(baja.getByText(`No se puede eliminar ${CUENTAS.nuevo.email}`)).toBeVisible();
		await baja.getByRole('button', { name: 'Dar de baja' }).click();
		await expect(aviso(page, 'Cuenta dada de baja')).toBeVisible();
		expect(api.llamadasA('POST', /\/dar-de-baja$/)).toHaveLength(1);
	});

	test('crea una cuenta con su tarjeta, contactos y redes', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.superadmin);
		await page.goto('/panel/usuarios/nuevo');
		await page.getByLabel(/^Correo/).fill('marta@me.test');
		await page.getByLabel(/^Nombres/).fill('Marta');
		await page.getByLabel('Apellidos').fill('Rivas');
		await page.getByRole('combobox', { name: /^Rubro/ }).fill('Arquitectura');
		await page.getByRole('textbox', { name: 'Dato del contacto 1' }).fill('+591 70011223');
		await page
			.getByRole('textbox', { name: 'Enlace de la red 1' })
			.fill('https://instagram.com/marta.arq');
		await expect(page.getByText(/Está libre: me\.svelpy\.com\/marta-rivas/)).toBeVisible();
		await page.getByRole('button', { name: 'Crear cuenta y tarjeta' }).click();

		await expect(aviso(page, 'Cuenta y tarjeta creadas')).toBeVisible();
		await expect(page.getByRole('heading', { level: 1, name: 'Marta Rivas' })).toBeVisible();

		const [cuenta] = api.llamadasA('POST', '/usuarios/');
		expect(cuenta.cuerpo).toEqual({
			email: 'marta@me.test',
			password: expect.any(String),
			rol: 'user'
		});
		const [tarjeta] = api.llamadasA('POST', '/tarjetas/');
		expect(tarjeta.cuerpo).toMatchObject({
			slug: 'marta-rivas',
			user_id: expect.any(String),
			contactos: [{ tipo: 'phone', valor: '+591 70011223', is_primary: true }],
			redes: [{ red: 'instagram', url: 'https://instagram.com/marta.arq' }]
		});
	});

	test('un correo en uso se marca en su campo', async ({ page }) => {
		await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.superadmin);
		await page.goto('/panel/usuarios/nuevo');
		await page.getByLabel(/^Correo/).fill(CUENTAS.ana.email);
		await page.getByRole('switch', { name: 'Crear su tarjeta ahora' }).click();
		await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
		await expect(page.getByText('Ya hay una cuenta con este correo.')).toBeVisible();
	});
});

test.describe('Pagos y planes', () => {
	test('registra un pago con el recibo a la vista y una sola clave por formulario', async ({
		page
	}) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.admin);
		const nuevo = api.porEmail(CUENTAS.nuevo.email)!.usuario;
		await page.goto(`/panel/usuarios/${nuevo.id}`);
		await page.getByRole('link', { name: 'Registrar pago' }).click();

		await expect(page.getByRole('heading', { level: 1, name: 'Registrar pago' })).toBeVisible();
		const recibo = page.getByRole('region', { name: 'Recibo del pago' });
		await expect(recibo.getByText(CUENTAS.nuevo.email)).toBeVisible();
		await page.getByLabel(/^Cómo pagó/).selectOption('qr');
		await page.getByRole('switch', { name: 'Cobrar otro monto' }).click();
		await page.getByLabel('Monto cobrado').fill('60');
		await expect(recibo.getByText('Precio de oferta')).toBeVisible();
		await page.getByLabel('Referencia').fill('TRX-0001');
		await page.getByRole('button', { name: 'Registrar pago' }).click();

		await expect(aviso(page, /^Pago registrado\./)).toBeVisible();
		await expect(page).toHaveURL(new RegExp(`/panel/usuarios/${nuevo.id}$`));
		const [pago] = api.llamadasA('POST', '/pagos/registrar');
		expect(pago.cuerpo).toMatchObject({
			user_id: nuevo.id,
			plan_id: expect.any(String),
			monto: 60,
			metodo: 'qr',
			referencia_externa: 'TRX-0001',
			idempotency_key: expect.stringMatching(/^pago-/)
		});
		// Ya es Pro: el detalle de la cuenta muestra el pago
		await expect(page.getByText('TRX-0001')).toBeVisible();
	});

	test('anular un pago dice cuántos días se descuentan', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.admin);
		const nuevo = api.porEmail(CUENTAS.nuevo.email)!.usuario;
		await page.goto(`/panel/pagos/nuevo?usuario=${nuevo.id}`);
		await page.getByLabel(/^Cómo pagó/).selectOption('efectivo');
		await page.getByRole('button', { name: 'Registrar pago' }).click();
		await expect(aviso(page, /^Pago registrado\./)).toBeVisible();

		await page.getByRole('button', { name: 'Anular' }).first().click();
		const confirmar = page.getByRole('alertdialog');
		await expect(confirmar.getByText(/Se descuentan 365 días del plan/)).toBeVisible();
		await confirmar.getByRole('button', { name: 'Anular pago' }).click();
		await expect(aviso(page, 'Pago anulado')).toBeVisible();
		await expect(page.getByText('Anulación').first()).toBeVisible();
	});

	test('edita el precio de un plan', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.admin);
		await page.goto('/panel/planes');
		await page.getByRole('button', { name: 'Editar' }).last().click();
		const hoja = page.getByRole('dialog', { name: 'Editar plan' });
		await hoja.getByLabel(/^Precio/).fill('90');
		await hoja.getByRole('button', { name: 'Guardar plan' }).click();
		await expect(aviso(page, 'Plan guardado')).toBeVisible();
		expect(api.llamadasA('PATCH', /^\/planes\//)[0].cuerpo).toMatchObject({ precio: 90 });
	});
});

test.describe('Inicio de los admins', () => {
	test('muestra los totales de la API y corre el mantenimiento a pedido', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.admin);
		await expect(page.getByText('tarjeta publicada', { exact: true })).toBeVisible();
		await expect(page.getByText('borrador', { exact: true })).toBeVisible();

		await page.getByRole('button', { name: 'Limpiar imágenes' }).click();
		await expect(aviso(page, 'Se borraron 2 imágenes sin usar')).toBeVisible();
		expect(api.llamadasA('POST', '/imagenes/limpiar-huerfanas')).toHaveLength(1);
	});
});
