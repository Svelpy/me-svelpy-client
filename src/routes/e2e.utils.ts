/**
 * Ayudas de los E2E del panel y de la tarjeta pública. Las respuestas de la API las da
 * `e2e.api.ts` (en el navegador) y `tests/apiPublica.mjs` (lo que se arma en el servidor).
 */
import { expect, type Page } from '@playwright/test';

export interface Cuenta {
	email: string;
	password: string;
}

/** PNG de 1×1 px: sirve de foto en las pruebas y para subir archivos */
export const PNG_1X1 = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
	'base64'
);

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
	await expect(page).toHaveURL(/\/panel(\/|$|\?)/);
}

/** Un aviso (toast) con ese texto exacto */
export function aviso(page: Page, texto: string | RegExp) {
	return page.locator('.notyf').getByText(texto, typeof texto === 'string' ? { exact: true } : {});
}
