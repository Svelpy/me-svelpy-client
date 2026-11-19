/**
 * Ayudas de los E2E del panel y de la tarjeta pública.
 *
 * Con los datos de prueba, el "backend" es el simulado de `src/lib/mocks`: vive en el navegador y
 * cada test arranca con un contexto limpio, así que siembra su propia base. Al pasar a la API real
 * estas pruebas necesitan mockear sus respuestas con `page.route()` (las cuentas y tarjetas de
 * abajo son las de `src/lib/mocks/seed`).
 */
import { expect, type Page } from '@playwright/test';

export interface Cuenta {
	email: string;
	password: string;
}

export const CUENTAS = {
	superadmin: { email: 'superadmin@me.test', password: 'Admin1234' },
	fabiola: { email: 'fabiola@me.test', password: 'Demo1234' },
	sinTarjeta: { email: 'nuevo@me.test', password: 'Demo1234' },
	inactiva: { email: 'inactivo@me.test', password: 'Demo1234' }
} satisfies Record<string, Cuenta>;

/** PNG de 1×1 px: sirve de foto en las pruebas y para subir archivos */
export const PNG_1X1 = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
	'base64'
);

/** Las fotos de los datos de prueba vienen de otros dominios: se responden aquí, sin red */
export async function sinImagenesExternas(page: Page): Promise<void> {
	await page.route(
		/^https:\/\/(images\.unsplash\.com|ui-avatars\.com|api\.qrserver\.com|randomuser\.me)\//,
		(route) => route.fulfill({ status: 200, contentType: 'image/png', body: PNG_1X1 })
	);
}

/** Completa el login y lo envía (sin comprobar a dónde lleva) */
export async function enviarLogin(page: Page, { email, password }: Cuenta): Promise<void> {
	await page.getByLabel('Correo').fill(email);
	await page.getByLabel('Contraseña', { exact: true }).fill(password);
	await page.getByRole('button', { name: 'Ingresar' }).click();
}

/** Entra con una cuenta y espera llegar al panel */
export async function iniciarSesion(page: Page, cuenta: Cuenta): Promise<void> {
	await page.goto('/auth/sign-in');
	await enviarLogin(page, cuenta);
	await expect(page).toHaveURL(/\/panel(\/|$)/);
}

/** Un aviso (toast) con ese texto exacto */
export function aviso(page: Page, texto: string) {
	return page.locator('.notyf').getByText(texto, { exact: true });
}
