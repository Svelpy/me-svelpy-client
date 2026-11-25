import { expect, test } from '@playwright/test';
import { apiFalsa, CUENTAS, TARJETA_PUBLICA, type ApiFalsa } from '../e2e.api';
import { aviso, iniciarSesion, PNG_1X1 } from '../e2e.utils';

// Ancho de escritorio: el editor muestra el espejo del teléfono al lado del formulario
test.use({ viewport: { width: 1440, height: 900 } });

const ID = TARJETA_PUBLICA.id;
const NOMBRE = 'Dra. Ana María Pérez Quispe';

test.describe('Panel del user', () => {
	let api: ApiFalsa;

	test.beforeEach(async ({ page }) => {
		api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.ana);
		await expect(page.getByRole('heading', { level: 1, name: NOMBRE })).toBeVisible();
	});

	test('ve cada cambio del perfil en el espejo y guarda solo sus datos', async ({ page }) => {
		const espejo = page.locator('[data-espejo]');
		await page.getByLabel('Cargo').fill('Pediatra y alergóloga');
		await expect(espejo.getByText('Pediatra y alergóloga')).toBeVisible();
		await expect(page.getByText('Vista previa con cambios sin guardar')).toBeVisible();

		await page.getByRole('button', { name: 'Guardar cambios' }).click();
		await expect(aviso(page, 'Cambios guardados')).toBeVisible();

		const [patch] = api.llamadasA('PATCH', `/tarjetas/${ID}`);
		expect(patch.cuerpo).toMatchObject({ cargo: 'Pediatra y alergóloga' });
		// Ni el slug (no lo cambia un user) ni las listas viajan con los datos
		expect(patch.cuerpo).not.toHaveProperty('slug');
		expect(patch.cuerpo).not.toHaveProperty('contactos');

		await page.reload();
		await expect(page.getByLabel('Cargo')).toHaveValue('Pediatra y alergóloga');
	});

	test('no puede cambiar el enlace de su tarjeta', async ({ page }) => {
		await expect(page.getByText(/Para cambiarlo, escríbenos/)).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Enlace de la tarjeta' })).toHaveCount(0);
	});

	test('agrega, edita y elimina un contacto enviando la lista completa', async ({ page }) => {
		await page.goto('/panel/mi-tarjeta?seccion=contacto');
		const lista = page.getByRole('list', { name: 'Agregar contacto' });
		await expect(lista.getByRole('listitem')).toHaveCount(3);

		await page.getByRole('button', { name: 'Agregar contacto' }).click();
		const hoja = page.getByRole('dialog', { name: 'Agregar contacto' });
		await hoja.getByLabel('Número').fill('+591 71234567');
		await hoja.getByLabel('Etiqueta').fill('Emergencias');
		await hoja.getByRole('button', { name: 'Agregar', exact: true }).click();
		await expect(aviso(page, 'Contacto agregado')).toBeVisible();
		await expect(lista.getByRole('listitem')).toHaveCount(4);

		// Estado final: los 3 de antes con su id y el nuevo sin id, cada uno con su orden
		const contactos = (
			api.llamadasA('PATCH', `/tarjetas/${ID}`).at(-1)!.cuerpo as {
				contactos: { id: string | null; orden: number; created_at?: string }[];
			}
		).contactos;
		expect(contactos).toHaveLength(4);
		expect(contactos.slice(0, 3).every((c) => typeof c.id === 'string')).toBe(true);
		expect(contactos[3]).toMatchObject({ id: null, valor: '+591 71234567', orden: 3 });
		expect(contactos[0]).not.toHaveProperty('created_at');

		await lista.getByRole('button', { name: 'Editar Emergencias' }).click();
		const edicion = page.getByRole('dialog', { name: 'Editar contacto' });
		await edicion.getByLabel('Etiqueta').fill('Urgencias');
		await edicion.getByRole('button', { name: 'Guardar cambios' }).click();
		await expect(aviso(page, 'Cambios guardados')).toBeVisible();
		await expect(lista.getByText('Urgencias')).toBeVisible();

		await lista.getByRole('button', { name: 'Eliminar Urgencias' }).click();
		await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click();
		await expect(aviso(page, 'Contacto eliminado')).toBeVisible();
		await expect(lista.getByRole('listitem')).toHaveCount(3);
	});

	test('sube el QR de pago desde Contacto', async ({ page }) => {
		await page.goto('/panel/mi-tarjeta?seccion=contacto');
		await page
			.getByLabel('QR de pago')
			.setInputFiles({ name: 'qr.png', mimeType: 'image/png', buffer: PNG_1X1 });
		await expect(aviso(page, 'QR de pago guardado')).toBeVisible();
		expect(api.llamadasA('POST', '/imagenes/uploads')).toHaveLength(1);
		expect(api.llamadasA('PATCH', `/tarjetas/${ID}`).at(-1)!.cuerpo).toEqual({
			qr_pago_url: expect.stringMatching(/^https:\/\/res\.cloudinary\.com\//)
		});
	});

	test('agrega a la vitrina un servicio con foto', async ({ page }) => {
		await page.goto('/panel/mi-tarjeta?seccion=vitrina');
		await page.getByRole('button', { name: 'Agregar a la vitrina' }).click();
		const hoja = page.getByRole('dialog', { name: 'Agregar a la vitrina' });
		await hoja.getByLabel('Título').fill('Control de lactancia');
		await hoja
			.getByLabel(/^Precio/)
			.first()
			.fill('180');
		await hoja
			.getByLabel('Agregar imágenes')
			.setInputFiles({ name: 'lactancia.png', mimeType: 'image/png', buffer: PNG_1X1 });
		await expect(hoja.getByRole('button', { name: 'Quitar la imagen 1' })).toBeVisible();

		await hoja.getByRole('button', { name: 'Agregar', exact: true }).click();
		await expect(aviso(page, 'Ítem agregado')).toBeVisible();
		await expect(page.locator('[data-espejo]').getByText('Control de lactancia')).toBeVisible();

		const items = (
			api.llamadasA('PATCH', `/vitrinas/${ID}`).at(-1)!.cuerpo as {
				items: { id: string | null; titulo: string; imagenes: { url: string }[] }[];
			}
		).items;
		expect(items.at(-1)).toMatchObject({ id: null, titulo: 'Control de lactancia' });
		expect(items.at(-1)!.imagenes[0].url).toMatch(/^https:\/\/res\.cloudinary\.com\//);
	});

	test('elige un tema: se envían sus colores, y luego solo la tipografía', async ({ page }) => {
		await page.goto('/panel/mi-tarjeta?seccion=apariencia');
		await expect(page.getByText(/Usas el tema Claro/)).toBeVisible();
		await page.getByText('Natural', { exact: true }).click();
		await page.getByRole('button', { name: 'Guardar apariencia' }).click();
		await expect(aviso(page, 'Apariencia guardada')).toBeVisible();

		const [colores] = api.llamadasA('PATCH', `/tarjeta-themes/${ID}`);
		expect(colores.cuerpo).toHaveProperty('color_fondo');
		expect(colores.cuerpo).not.toHaveProperty('preset');
		expect(colores.cuerpo).not.toHaveProperty('tipografia');
		// La API lo dejó como personalizado (preset null), pero se reconoce por sus colores
		await expect(page.getByText(/Usas el tema Natural/)).toBeVisible();

		await page.getByRole('radio', { name: /Editorial\./ }).check({ force: true });
		await page.getByRole('button', { name: 'Guardar apariencia' }).click();
		await expect(aviso(page, 'Apariencia guardada').last()).toBeVisible();
		expect(api.llamadasA('PATCH', `/tarjeta-themes/${ID}`)[1].cuerpo).toEqual({ tipografia: 2 });
	});

	test('oculta una sección enviando las 8', async ({ page }) => {
		await page.getByRole('button', { name: 'Ocultar Redes en la tarjeta' }).click();
		await expect(page.getByRole('button', { name: 'Mostrar Redes en la tarjeta' })).toBeVisible();
		const secciones = (
			api.llamadasA('PATCH', `/tarjetas/${ID}`).at(-1)!.cuerpo as {
				secciones: { id: string; is_visible: boolean }[];
			}
		).secciones;
		expect(secciones).toHaveLength(8);
		expect(secciones.filter((s) => !s.is_visible)).toHaveLength(2);
	});

	test('pasa su tarjeta a borrador y la vuelve a publicar', async ({ page }) => {
		await page.getByRole('button', { name: 'Pasar a borrador' }).click();
		await expect(aviso(page, 'La tarjeta pasó a borrador')).toBeVisible();
		await page.getByRole('button', { name: 'Publicar tarjeta' }).click();
		await expect(aviso(page, 'Tarjeta publicada')).toBeVisible();
		expect(api.llamadasA('POST', `/tarjetas/${ID}/despublicar`)).toHaveLength(1);
		expect(api.llamadasA('POST', `/tarjetas/${ID}/publicar`)).toHaveLength(1);
	});

	test('cambia su contraseña sin cerrar la sesión', async ({ page }) => {
		await page.goto('/panel/cuenta');
		await page.getByLabel(/^Contraseña actual/).fill('Equivocada1');
		await page.getByLabel(/^Contraseña nueva/).fill('Nueva5678');
		await page.getByLabel(/^Repite la contraseña nueva/).fill('Nueva5678');
		await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
		await expect(page.getByText('La contraseña actual no es correcta.')).toBeVisible();

		await page.getByLabel(/^Contraseña actual/).fill(CUENTAS.ana.password);
		await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
		await expect(aviso(page, 'Contraseña cambiada. Cerramos tus otras sesiones.')).toBeVisible();
		await expect(page).toHaveURL(/\/panel\/cuenta$/);
		expect(api.llamadasA('POST', '/auth/change-password').at(-1)!.cuerpo).toEqual({
			current_password: CUENTAS.ana.password,
			new_password: 'Nueva5678'
		});
	});
});

test.describe('User sin verificar y Free', () => {
	test('el aviso pide verificar el correo y publicar queda bloqueado', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.nuevo);
		await expect(page.getByText(/Verifica tu correo para poder publicar/)).toBeVisible();
		await expect(page.getByRole('button', { name: 'Publicar tarjeta' })).toBeDisabled();

		await page.getByRole('button', { name: 'Reenviar enlace' }).first().click();
		await expect(aviso(page, `Enlace enviado a ${CUENTAS.nuevo.email}`)).toBeVisible();
		expect(api.llamadasA('POST', '/auth/resend-verification')).toHaveLength(1);
	});

	test('cambia su correo y queda sin verificar', async ({ page }) => {
		await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.ana);
		await page.goto('/panel/cuenta');
		await page.getByRole('button', { name: 'Cambiar', exact: true }).click();
		await page.getByLabel(/^Correo nuevo/).fill('ana.nueva@me.test');
		await page.getByRole('button', { name: 'Guardar correo' }).click();
		await expect(aviso(page, /Correo cambiado/)).toBeVisible();
		await expect(page.getByText('Sin verificar')).toBeVisible();
		await expect(page.getByText(/Verifica tu correo para poder publicar/)).toBeVisible();
	});
});

test.describe('User sin tarjeta', () => {
	test('crea su tarjeta con el formulario corto y llega al editor', async ({ page }) => {
		const api = await apiFalsa(page);
		await iniciarSesion(page, CUENTAS.sinTarjeta);
		await expect(page.getByRole('heading', { level: 1, name: 'Creemos tu tarjeta' })).toBeVisible();

		await page.getByLabel(/^Nombres/).fill('Sofía');
		await page.getByLabel('Apellidos').fill('Arce');
		await page.getByRole('combobox', { name: /^Rubro/ }).fill('Nutrición deportiva');
		await expect(page.getByRole('textbox', { name: /^Enlace de la tarjeta/ })).toHaveValue(
			'sofia-arce'
		);
		await page.getByRole('button', { name: 'Crear tarjeta' }).click();

		await expect(page.getByRole('heading', { level: 1, name: 'Sofía Arce' })).toBeVisible();
		const [creada] = api.llamadasA('POST', '/tarjetas/');
		expect(creada.cuerpo).toMatchObject({ slug: 'sofia-arce', nombres: 'Sofía' });
		expect(creada.cuerpo).not.toHaveProperty('user_id');
	});
});
