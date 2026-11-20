import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Plan } from '#lib/config/planes.config.ts';
import { finDelDia } from '#lib/utils/date.ts';
import { formatVencimiento } from '#lib/utils/plan.ts';
import CamposPlan from './camposPlan.svelte';
import EstadoPlan from './estadoPlan.svelte';

const enDias = (dias: number) => new Date(Date.now() + dias * 86_400_000).toISOString();
/** Como lo guarda el panel: al final del día, dentro de `dias` días */
const venceEn = (dias: number) => finDelDia(enDias(dias));

describe('EstadoPlan', () => {
	it('dice hasta cuándo dura un Pro', async () => {
		const vence = enDias(120);
		const screen = await render(EstadoPlan, { cuenta: { plan: 'pro', plan_vence_at: vence } });
		await expect
			.element(screen.getByText(`Plan Pro, hasta el ${formatVencimiento(vence)}`))
			.toBeVisible();
	});

	it('avisa cuando el Pro vence pronto', async () => {
		const screen = await render(EstadoPlan, {
			cuenta: { plan: 'pro', plan_vence_at: venceEn(9) }
		});
		await expect.element(screen.getByText('Plan Pro, vence en 9 días')).toBeVisible();
	});

	it('un Pro sin fecha no vence y un Pro vencido ya es Free', async () => {
		const sinFecha = await render(EstadoPlan, { cuenta: { plan: 'pro', plan_vence_at: null } });
		await expect.element(sinFecha.getByText('Plan Pro, sin vencimiento')).toBeVisible();
		sinFecha.unmount();

		const vencido = await render(EstadoPlan, {
			cuenta: { plan: 'pro', plan_vence_at: enDias(-1) }
		});
		await expect.element(vencido.getByText('Plan Free', { exact: true })).toBeVisible();
	});

	it('en una celda pone el plan y el detalle en dos líneas', async () => {
		const screen = await render(EstadoPlan, {
			cuenta: { plan: 'pro', plan_vence_at: venceEn(3) },
			variante: 'celda'
		});
		await expect.element(screen.getByText('Pro', { exact: true })).toBeVisible();
		await expect.element(screen.getByText('vence en 3 días')).toBeVisible();
	});
});

describe('CamposPlan', () => {
	it('pide la fecha solo con Pro', async () => {
		const screen = await render(CamposPlan, { plan: Plan.FREE, vence: '' });
		await expect.element(screen.getByLabelText('Vence el')).not.toBeInTheDocument();
		await expect
			.element(screen.getByText('Con Free puede editar toda su tarjeta, pero no publicarla.'))
			.toBeVisible();

		await screen.getByRole('radio', { name: 'Pro' }).click();
		await expect.element(screen.getByLabelText('Vence el')).toBeVisible();
	});
});
