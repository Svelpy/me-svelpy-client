import { expect, test } from '@playwright/test';
import {
	aviso,
	CUENTAS,
	enviarLogin,
	iniciarSesion,
	PNG_1X1,
	sinImagenesExternas
} from '../e2e.utils';

// Ancho de escritorio: el editor muestra el espejo del teléfono al lado del formulario
test.use({ viewport: { width: 1440, height: 900 } });

test.describe('Panel del propietario', () => {
	test.beforeEach(async ({ page }) => {
		await sinImagenesExternas(page);
		await iniciarSesion(page, CUENTAS.fabiola);
	});

	test('ve cada cambio del perfil en el espejo antes de guardarlo', async ({ page }) => {
		const espejo = page.locator('[data-espejo]');
		await page.getByLabel('Cargo').fill('Pediatra y alergóloga');
		await expect(espejo.getByText('Pediatra y alergóloga')).toBeVisible();
		await expect(page.getByText('Vista previa con cambios sin guardar')).toBeVisible();

		await page.getByRole('button', { name: 'Guardar cambios' }).click();
		await expect(aviso(page, 'Cambios guardados')).toBeVisible();

		await page.reload();
		await expect(page.getByLabel('Cargo')).toHaveValue('Pediatra y alergóloga');
	});

	test('no puede cambiar la dirección de su tarjeta', async ({ page }) => {
		await expect(page.getByText('Para cambiarla, escríbenos')).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Dirección de la tarjeta' })).toHaveCount(0);
	});

	test('agrega, edita y elimina un contacto', async ({ page }) => {
		await page.goto('/panel/mi-tarjeta?seccion=contacto');
		const lista = page.getByRole('list', { name: 'Agregar contacto' });
		await expect(lista.getByRole('listitem')).toHaveCount(4);

		await page.getByRole('button', { name: 'Agregar contacto' }).click();
		const hoja = page.getByRole('dialog', { name: 'Agregar contacto' });
		await hoja.getByLabel('Número').fill('+591 71234567');
		await hoja.getByLabel('Etiqueta').fill('Emergencias');
		await hoja.getByRole('button', { name: 'Agregar', exact: true }).click();
		await expect(aviso(page, 'Contacto agregado')).toBeVisible();
		await expect(lista.getByRole('listitem')).toHaveCount(5);
		await expect(lista.getByText('Emergencias')).toBeVisible();

		await lista.getByRole('button', { name: 'Editar Emergencias' }).click();
		const edicion = page.getByRole('dialog', { name: 'Editar contacto' });
		await edicion.getByLabel('Etiqueta').fill('Urgencias');
		await edicion.getByRole('button', { name: 'Guardar cambios' }).click();
		await expect(aviso(page, 'Cambios guardados')).toBeVisible();
		await expect(lista.getByText('Urgencias')).toBeVisible();

		await lista.getByRole('button', { name: 'Eliminar Urgencias' }).click();
		await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click();
		await expect(aviso(page, 'Contacto eliminado')).toBeVisible();
		await expect(lista.getByRole('listitem')).toHaveCount(4);
	});

	test('agrega a la vitrina un servicio con foto', async ({ page }) => {
		await page.goto('/panel/mi-tarjeta?seccion=vitrina');
		await page.getByRole('button', { name: 'Agregar a la vitrina' }).click();
		const hoja = page.getByRole('dialog', { name: 'Agregar a la vitrina' });
		await hoja.getByLabel('Título').fill('Control de lactancia');
		await hoja.getByLabel('Precio (BOB)').fill('180');
		await hoja
			.getByLabel('Agregar imágenes')
			.setInputFiles({ name: 'lactancia.png', mimeType: 'image/png', buffer: PNG_1X1 });
		await expect(hoja.getByRole('button', { name: 'Quitar la imagen 1' })).toBeVisible();

		await hoja.getByRole('button', { name: 'Agregar', exact: true }).click();
		await expect(aviso(page, 'Ítem agregado')).toBeVisible();
		await expect(
			page.getByRole('list', { name: 'Agregar a la vitrina' }).getByText('Control de lactancia')
		).toBeVisible();
		await expect(page.locator('[data-espejo]').getByText('Control de lactancia')).toBeVisible();
	});

	test('cambia el tema y la tipografía, y la tarjeta pública los usa', async ({ page }) => {
		await page.goto('/panel/mi-tarjeta?seccion=apariencia');
		await page.getByText('Natural', { exact: true }).click();
		await page.getByRole('radio', { name: /Editorial\./ }).check({ force: true });
		await page.getByRole('button', { name: 'Guardar apariencia' }).click();
		await expect(aviso(page, 'Apariencia guardada')).toBeVisible();

		await page.goto('/doctora-fabiola');
		// Fondo del tema Natural: #F6F7F2
		await expect(page.getByTestId('tarjeta-vista')).toHaveCSS(
			'background-color',
			'rgb(246, 247, 242)'
		);
		await expect(
			page.getByRole('heading', { level: 1, name: 'Dra. Fabiola Mendoza Rojas' })
		).toHaveCSS('font-family', /ME Fraunces/);
	});

	test('oculta y reordena secciones desde el índice', async ({ page }) => {
		const secciones = page.getByRole('list', { name: 'Secciones' });
		await page.getByRole('button', { name: 'Ocultar Redes en la tarjeta' }).click();
		await expect(page.getByRole('button', { name: 'Mostrar Redes en la tarjeta' })).toBeVisible();

		await page.getByRole('button', { name: 'Cambiar orden' }).click();
		await secciones.getByRole('button', { name: 'Bajar Accesos rápidos' }).click();
		await expect(secciones.getByRole('listitem').first()).toContainText('Acerca de mí');
		await page.getByRole('button', { name: 'Listo' }).click();

		await page.goto('/doctora-fabiola');
		await expect(page.getByRole('region', { name: 'Contacto' })).toBeVisible();
		await expect(page.getByRole('region', { name: 'Redes' })).toHaveCount(0);
		const titulos = await page.getByTestId('tarjeta-vista').locator('section h2').allTextContents();
		expect(titulos.indexOf('Acerca de mí')).toBeLessThan(titulos.indexOf('Accesos rápidos'));
	});

	test('pasa su tarjeta a borrador y la vuelve a publicar', async ({ page }) => {
		await page.getByRole('button', { name: 'Pasar a borrador' }).click();
		await expect(aviso(page, 'La tarjeta pasó a borrador')).toBeVisible();

		await page.goto('/doctora-fabiola');
		await expect(
			page.getByRole('heading', { name: 'Esta tarjeta no existe o todavía no está publicada' })
		).toBeVisible();

		await page.goto('/panel/mi-tarjeta');
		await page.getByRole('button', { name: 'Publicar tarjeta' }).click();
		await expect(aviso(page, 'Tarjeta publicada')).toBeVisible();
		await page.goto('/doctora-fabiola');
		await expect(
			page.getByRole('heading', { level: 1, name: 'Dra. Fabiola Mendoza Rojas' })
		).toBeVisible();
	});

	test('cambia su contraseña y vuelve a entrar con la nueva', async ({ page }) => {
		await page.goto('/panel/cuenta');
		await page.getByLabel('Contraseña actual').fill(CUENTAS.fabiola.password);
		// Los campos obligatorios llevan " *" en la etiqueta
		await page.getByLabel(/^Contraseña nueva/).fill('Nueva5678');
		await page.getByLabel('Repite la contraseña nueva').fill('Nueva5678');
		await page.getByRole('button', { name: 'Cambiar contraseña' }).click();

		await expect(page).toHaveURL(/\/auth\/sign-in\?motivo=password/);
		await expect(page.getByText('Tu contraseña cambió. Ingresa con la nueva.')).toBeVisible();
		await enviarLogin(page, { email: CUENTAS.fabiola.email, password: 'Nueva5678' });
		await expect(page).toHaveURL(/\/panel\/mi-tarjeta$/);
	});
});

test.describe('Propietario sin tarjeta', () => {
	test('crea su tarjeta con el formulario corto y llega al editor', async ({ page }) => {
		await sinImagenesExternas(page);
		await iniciarSesion(page, CUENTAS.sinTarjeta);
		await expect(page.getByRole('heading', { level: 1, name: 'Creemos tu tarjeta' })).toBeVisible();

		await page.getByLabel('Nombres').fill('Sofía');
		await page.getByLabel('Apellidos').fill('Arce');
		await page.getByRole('combobox', { name: 'Rubro' }).fill('Nutrición deportiva');
		await expect(page.getByLabel('Dirección de la tarjeta')).toHaveValue('sofia-arce');
		await page.getByRole('button', { name: 'Crear tarjeta' }).click();

		await expect(page.getByRole('heading', { level: 1, name: 'Sofía Arce' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Publicar tarjeta' })).toBeVisible();
	});
});
