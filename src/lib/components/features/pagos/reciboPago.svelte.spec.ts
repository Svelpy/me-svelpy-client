import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { formatVencimiento, formatearMonto } from '#lib/utils/plan.ts';
import { planDePrueba } from '../tarjeta/tarjetaDePrueba.ts';
import ReciboPago from './reciboPago.svelte';

const DESDE = new Date('2026-03-01T12:00:00.000Z');

describe('ReciboPago', () => {
	it('sin oferta cobra el precio del plan y dice hasta cuándo queda', async () => {
		const plan = planDePrueba();
		const screen = await render(ReciboPago, {
			email: 'lucia@prueba.test',
			plan,
			monto: null,
			metodo: 'qr',
			referencia: '',
			desde: DESDE
		});
		await expect.element(screen.getByText(formatearMonto(80, 'USD'))).toBeVisible();
		const hasta = new Date(DESDE.getTime() + 365 * 86_400_000).toISOString();
		await expect.element(screen.getByText(formatVencimiento(hasta))).toBeVisible();
		await expect.element(screen.getByText('QR')).toBeVisible();
	});

	it('con oferta tacha el precio de lista', async () => {
		const screen = await render(ReciboPago, {
			email: 'lucia@prueba.test',
			plan: planDePrueba(),
			monto: 60,
			metodo: 'efectivo',
			referencia: 'TRX-1',
			desde: DESDE
		});
		await expect.element(screen.getByText(formatearMonto(60, 'USD'))).toBeVisible();
		await expect.element(screen.getByText('Precio de oferta')).toBeVisible();
		await expect.element(screen.getByText('TRX-1')).toBeVisible();
	});

	it('marca lo que falta elegir', async () => {
		const screen = await render(ReciboPago, {
			email: null,
			plan: null,
			monto: null,
			metodo: null,
			referencia: '',
			desde: DESDE
		});
		await expect.element(screen.getByText('Elige un plan')).toBeVisible();
		await expect.element(screen.getByText('Falta elegir').first()).toBeVisible();
	});
});
