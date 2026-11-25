import { expect, test, type Page } from '@playwright/test';
import { apiFalsa, CUENTAS } from './e2e.api';

// Escritorio: además del formulario se ve la tarjeta que se arma
test.use({ viewport: { width: 1440, height: 900 } });

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
		const api = await apiFalsa(page);
		await page.goto('/auth/sign-in');
		await page.getByRole('link', { name: 'Crea tu tarjeta' }).click();

		// Paso 1: el enlace, con el dominio pegado y la revisión en vivo
		await expect(titulo(page, 'Elige tu enlace')).toBeVisible();
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
		await page.getByRole('button', { name: 'Crear mi tarjeta' }).click();

		await expect(page).toHaveURL(/\/panel\/mi-tarjeta/);
		await expect(titulo(page, 'Rocío Suárez')).toBeVisible();

		// El registro no inicia sesión: después se entra con las mismas credenciales
		const [registro] = api.llamadasA('POST', '/auth/register');
		expect(registro.cuerpo).toMatchObject({
			email: 'rocio@me.test',
			tarjeta: {
				slug: 'rocio-suarez',
				nombres: 'Rocío',
				rubro: 'Nutrición',
				theme: { preset: expect.any(String) }
			}
		});
		expect(api.llamadasA('POST', '/auth/login')[0].cuerpo).toMatchObject({
			email: 'rocio@me.test'
		});

		// Free y sin verificar: el editor dice qué falta para publicar
		await expect(page.getByText(/Verifica tu correo para poder publicar/)).toBeVisible();
		await expect(page.getByText('Publicar es parte del plan Pro')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Activar Pro' })).toHaveAttribute(
			'href',
			/^https:\/\/wa\.me\//
		);
		await expect(page.getByRole('button', { name: 'Publicar tarjeta' })).toBeDisabled();
	});

	test('un enlace tomado no deja seguir y ofrece otro libre con un clic', async ({ page }) => {
		await apiFalsa(page);
		await page.goto('/auth/sign-up?enlace=dra-ana-perez');
		const enlace = page.getByLabel(/^Tu enlace/);
		await expect(enlace).toHaveValue('dra-ana-perez');
		await expect(page.getByText('Ya está en uso.')).toBeVisible();

		await continuar(page).click();
		await expect(titulo(page, 'Elige tu enlace')).toBeVisible();

		await page.getByRole('button', { name: 'Usar dra-ana-perez-2' }).click();
		await expect(enlace).toHaveValue('dra-ana-perez-2');
		await expect(page.getByText('Está libre: me.svelpy.com/dra-ana-perez-2')).toBeVisible();
		await continuar(page).click();
		await expect(titulo(page, 'Crea tu acceso')).toBeVisible();
	});

	test('un enlace reservado se explica sin preguntarle al servidor', async ({ page }) => {
		const api = await apiFalsa(page);
		await page.goto('/auth/sign-up?enlace=panel');
		await expect(page.getByText('Esa dirección está reservada. Prueba con otra.')).toBeVisible();
		expect(api.llamadasA('GET', /slug-disponible/)).toHaveLength(0);
	});

	test('si el correo ya tiene cuenta, vuelve al paso del acceso', async ({ page }) => {
		await apiFalsa(page);
		await page.goto('/auth/sign-up?enlace=ana-otra');
		await expect(page.getByText('Está libre: me.svelpy.com/ana-otra')).toBeVisible();
		await continuar(page).click();
		await completarAcceso(page, CUENTAS.ana.email);

		await page.getByLabel(/^Nombres/).fill('Ana');
		await page.getByRole('combobox', { name: /^Rubro/ }).fill('Pediatría');
		await page.getByRole('button', { name: 'Crear mi tarjeta' }).click();

		await expect(titulo(page, 'Crea tu acceso')).toBeVisible();
		await expect(page.getByText('Ya hay una cuenta con este correo.')).toBeVisible();
	});

	test('Atrás conserva lo escrito', async ({ page }) => {
		await apiFalsa(page);
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
