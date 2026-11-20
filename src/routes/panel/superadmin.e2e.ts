import { expect, test } from '@playwright/test';
import { aviso, CUENTAS, iniciarSesion, sinImagenesExternas } from '../e2e.utils';

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Panel del superadministrador', () => {
	test.beforeEach(async ({ page }) => {
		await sinImagenesExternas(page);
		await iniciarSesion(page, CUENTAS.superadmin);
	});

	test('el inicio resume las tarjetas y lleva al directorio por rubro', async ({ page }) => {
		await expect(page.getByText('tarjetas publicadas')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Actualizadas hace poco' })).toBeVisible();
		await page
			.getByRole('region', { name: 'Tarjetas por rubro' })
			.getByRole('link', { name: /Odontología/ })
			.click();
		await expect(page).toHaveURL(/\/panel\/tarjetas\?q=Odontolog%C3%ADa/);
		await expect(page.getByRole('link', { name: /Dra\. Camila Rivas/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Rodrigo Paz/ })).toHaveCount(0);
	});

	test('crea una cuenta con su tarjeta, contactos y redes en un solo paso', async ({ page }) => {
		await page.goto('/panel/usuarios/nuevo');
		await page.getByLabel(/^Correo/).fill('carla@me.test');
		await page.getByLabel('Nombres').fill('Carla');
		await page.getByLabel('Apellidos').fill('Vaca');
		await page.getByRole('combobox', { name: 'Rubro' }).fill('Nutrición deportiva');
		await page.getByLabel('Dato del contacto 1').fill('+591 70011223');
		await page.getByLabel('Dato del contacto 2').fill('carla@nutricion.test');
		await page.getByLabel('Enlace de la red 1').fill('https://instagram.com/carla.nutri');
		await page.getByRole('button', { name: 'Crear cuenta y tarjeta' }).click();

		await expect(aviso(page, 'Cuenta y tarjeta creadas')).toBeVisible();
		await expect(page).toHaveURL(/\/panel\/tarjetas\/[\w-]+$/);
		await expect(page.getByRole('heading', { level: 1, name: 'Carla Vaca' })).toBeVisible();
		await expect(page.getByText('Cuenta: carla@me.test')).toBeVisible();

		// Los contactos y la red llegaron con la misma creación
		const editor = page.url();
		await page.goto(`${editor}?seccion=contacto`);
		const contactos = page.getByRole('list', { name: 'Agregar contacto' });
		await expect(contactos.getByText('+591 70011223')).toBeVisible();
		await expect(contactos.getByText('carla@nutricion.test')).toBeVisible();
		await page.goto(`${editor}?seccion=redes`);
		await expect(
			page.getByRole('list', { name: 'Agregar red' }).getByText('Instagram')
		).toBeVisible();
	});

	test('avisa en el campo cuando el correo ya existe', async ({ page }) => {
		await page.goto('/panel/usuarios/nuevo');
		await page.getByLabel(/^Correo/).fill(CUENTAS.fabiola.email);
		await page.getByRole('switch', { name: 'Crear su tarjeta ahora' }).click();
		await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
		await expect(page.getByLabel(/^Correo/)).toHaveAttribute('aria-invalid', 'true');
		await expect(page).toHaveURL(/\/panel\/usuarios\/nuevo$/);
	});

	test('edita, desactiva y elimina una cuenta desde su menú', async ({ page }) => {
		await page.goto('/panel/usuarios');
		const tabla = page.getByRole('table');

		await tabla.getByRole('button', { name: 'Acciones para andres@me.test' }).click();
		await page.getByRole('menuitem', { name: 'Editar cuenta' }).click();
		const hoja = page.getByRole('dialog', { name: 'Editar cuenta' });
		await hoja.getByLabel('Correo').fill('andres.quiroga@me.test');
		await hoja.getByRole('button', { name: 'Guardar cambios' }).click();
		await expect(aviso(page, 'Cuenta actualizada')).toBeVisible();
		await expect(tabla.getByText('andres.quiroga@me.test')).toBeVisible();

		await tabla.getByRole('button', { name: 'Acciones para camila@me.test' }).click();
		await page.getByRole('menuitem', { name: 'Desactivar cuenta' }).click();
		await page.getByRole('alertdialog').getByRole('button', { name: 'Desactivar cuenta' }).click();
		await expect(aviso(page, 'Cuenta desactivada')).toBeVisible();
		await expect(tabla.getByRole('row', { name: /camila@me\.test/ })).toContainText('Desactivada');

		await tabla.getByRole('button', { name: 'Acciones para camila@me.test' }).click();
		await page.getByRole('menuitem', { name: 'Eliminar cuenta' }).click();
		await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar cuenta' }).click();
		await expect(aviso(page, 'Cuenta eliminada')).toBeVisible();
		await expect(tabla.getByText('camila@me.test')).toHaveCount(0);

		// Su tarjeta se fue con la cuenta
		await page.goto('/dra-camila-rivas');
		await expect(
			page.getByRole('heading', { name: 'Esta tarjeta no existe o todavía no está publicada' })
		).toBeVisible();
	});

	test('su propia cuenta no se puede desactivar ni eliminar', async ({ page }) => {
		await page.goto('/panel/usuarios');
		await page
			.getByRole('table')
			.getByRole('button', { name: `Acciones para ${CUENTAS.superadmin.email}` })
			.click();
		await expect(page.getByRole('menuitem', { name: 'Editar cuenta' })).toBeVisible();
		await expect(page.getByRole('menuitem', { name: 'Desactivar cuenta' })).toHaveCount(0);
		await expect(page.getByRole('menuitem', { name: 'Eliminar cuenta' })).toHaveCount(0);
	});

	test('el directorio filtra por texto y estado, y cambia de vista', async ({ page }) => {
		await page.goto('/panel/tarjetas');
		await page.getByLabel('Buscar').fill('pediatr');
		await expect(page).toHaveURL(/q=pediatr/);
		await expect(page.getByRole('link', { name: /Dra\. Fabiola Mendoza Rojas/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Rodrigo Paz/ })).toHaveCount(0);

		await page.getByLabel('Buscar').fill('');
		await expect(page).not.toHaveURL(/q=/);
		await page.getByText('Borradores', { exact: true }).click();
		await expect(page).toHaveURL(/estado=borrador/);
		await expect(page.getByRole('link', { name: /Paola Gutiérrez/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Dra\. Fabiola Mendoza Rojas/ })).toHaveCount(0);

		await page.getByText('Lista', { exact: true }).click();
		await expect(page).toHaveURL(/vista=lista/);
		await expect(page.getByRole('table')).toBeVisible();
	});

	test('edita la tarjeta de otra persona y puede cambiar su enlace', async ({ page }) => {
		await page.goto('/panel/tarjetas');
		await page.getByRole('link', { name: /Rodrigo Paz/ }).click();
		await expect(page.getByRole('heading', { level: 1, name: 'Rodrigo Paz' })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Enlace de la tarjeta' })).toBeEditable();

		await page.getByLabel('Cargo').fill('Chef ejecutivo');
		await page.getByRole('button', { name: 'Guardar cambios' }).click();
		await expect(aviso(page, 'Cambios guardados')).toBeVisible();
		await page.goto('/chef-rodrigo-paz');
		await expect(page.getByText('Chef ejecutivo').first()).toBeVisible();
	});

	test('elimina una tarjeta con confirmación', async ({ page }) => {
		await page.goto('/panel/tarjetas');
		await page.getByRole('link', { name: /Diego Salazar/ }).click();
		await page.getByRole('button', { name: 'Eliminar tarjeta' }).click();
		await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar tarjeta' }).click();
		await expect(aviso(page, 'Tarjeta eliminada')).toBeVisible();
		await expect(page).toHaveURL(/\/panel\/tarjetas$/);
		await expect(page.getByRole('link', { name: /Diego Salazar/ })).toHaveCount(0);
	});

	test('crea la tarjeta de una cuenta que todavía no tiene', async ({ page }) => {
		await page.goto('/panel/usuarios');
		await page.getByRole('table').getByRole('link', { name: 'Crear su tarjeta' }).click();
		await expect(page).toHaveURL(/\/panel\/tarjetas\/nueva\?cuenta=/);
		await expect(page.getByRole('combobox', { name: /^Cuenta/ })).not.toHaveValue('');

		await page.getByLabel('Nombres').fill('Tomás');
		await page.getByLabel('Apellidos').fill('Rivero');
		await page.getByRole('combobox', { name: 'Rubro' }).fill('Contaduría pública');
		await page.getByRole('button', { name: 'Crear tarjeta' }).click();
		await expect(page.getByRole('heading', { level: 1, name: 'Tomás Rivero' })).toBeVisible();
		await expect(page.getByText('Cuenta: nuevo@me.test')).toBeVisible();
	});
});
