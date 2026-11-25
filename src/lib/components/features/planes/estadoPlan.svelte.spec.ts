import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { finDelDia } from '#lib/utils/date.ts';
import { formatVencimiento } from '#lib/utils/plan.ts';
import EstadoPlan from './estadoPlan.svelte';

const PRO = { codigo: 'pro', nombre: 'Pro' };
const enDias = (dias: number) => new Date(Date.now() + dias * 86_400_000).toISOString();
/** Al final del día, dentro de `dias` días */
const venceEn = (dias: number) => finDelDia(enDias(dias));

describe('EstadoPlan', () => {
	it('dice hasta cuándo dura un plan pago', async () => {
		const vence = enDias(120);
		const screen = await render(EstadoPlan, { cuenta: { plan: PRO, plan_vence_at: vence } });
		await expect
			.element(screen.getByText(`Plan Pro, hasta el ${formatVencimiento(vence)}`))
			.toBeVisible();
	});

	it('avisa cuando vence pronto', async () => {
		const screen = await render(EstadoPlan, { cuenta: { plan: PRO, plan_vence_at: venceEn(9) } });
		await expect.element(screen.getByText('Plan Pro, vence en 9 días')).toBeVisible();
	});

	it('un plan vencido lo dice con su fecha', async () => {
		const vence = enDias(-1);
		const screen = await render(EstadoPlan, { cuenta: { plan: PRO, plan_vence_at: vence } });
		await expect
			.element(screen.getByText(`Plan Pro, venció el ${formatVencimiento(vence)}`))
			.toBeVisible();
	});

	it('Free va sin fecha', async () => {
		const screen = await render(EstadoPlan, {
			cuenta: { plan: { codigo: 'free', nombre: 'Free' }, plan_vence_at: enDias(30) }
		});
		await expect.element(screen.getByText('Plan Free', { exact: true })).toBeVisible();
	});

	it('en una celda pone el plan y el detalle en dos líneas', async () => {
		const screen = await render(EstadoPlan, {
			cuenta: { plan: PRO, plan_vence_at: venceEn(3) },
			variante: 'celda'
		});
		await expect.element(screen.getByText('Pro', { exact: true })).toBeVisible();
		await expect.element(screen.getByText('vence en 3 días')).toBeVisible();
	});
});
