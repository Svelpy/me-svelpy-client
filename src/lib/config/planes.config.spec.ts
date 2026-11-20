import { describe, expect, it } from 'vitest';
import {
	diasParaVencer,
	isPlan,
	Plan,
	planVigente,
	puedePublicar,
	vencePronto
} from './planes.config.ts';

const AHORA = new Date('2026-11-19T12:00:00Z');
const enDias = (dias: number) => new Date(AHORA.getTime() + dias * 86_400_000).toISOString();

describe('planVigente', () => {
	it('un pro sin vencimiento o con fecha futura sigue siendo pro', () => {
		expect(planVigente({ plan: 'pro', plan_vence_at: null }, AHORA)).toBe(Plan.PRO);
		expect(planVigente({ plan: 'pro', plan_vence_at: enDias(3) }, AHORA)).toBe(Plan.PRO);
	});

	it('un pro vencido cuenta como free aunque el backend no lo haya bajado todavía', () => {
		expect(planVigente({ plan: 'pro', plan_vence_at: enDias(-1) }, AHORA)).toBe(Plan.FREE);
		expect(planVigente({ plan: 'pro', plan_vence_at: AHORA.toISOString() }, AHORA)).toBe(Plan.FREE);
	});

	it('free y los planes desconocidos no dan permisos', () => {
		expect(planVigente({ plan: 'free', plan_vence_at: null }, AHORA)).toBe(Plan.FREE);
		expect(planVigente({ plan: 'premium', plan_vence_at: null }, AHORA)).toBe(Plan.FREE);
	});
});

describe('puedePublicar', () => {
	it('solo con pro vigente', () => {
		expect(puedePublicar({ plan: 'pro', plan_vence_at: enDias(30) }, AHORA)).toBe(true);
		expect(puedePublicar({ plan: 'pro', plan_vence_at: enDias(-30) }, AHORA)).toBe(false);
		expect(puedePublicar({ plan: 'free', plan_vence_at: null }, AHORA)).toBe(false);
	});
});

describe('vencimiento', () => {
	it('cuenta días de calendario hasta el día del vencimiento', () => {
		// En hora local: hoy 10:00 y vence el 28 a las 23:59 → 9 días, aunque sean casi 10 × 24 h
		const hoy = new Date(2026, 10, 19, 10, 0);
		const vence = (dia: number) => new Date(2026, 10, dia, 23, 59, 59).toISOString();
		expect(diasParaVencer({ plan: 'pro', plan_vence_at: vence(28) }, hoy)).toBe(9);
		expect(diasParaVencer({ plan: 'pro', plan_vence_at: vence(20) }, hoy)).toBe(1);
		expect(diasParaVencer({ plan: 'pro', plan_vence_at: vence(19) }, hoy)).toBe(0);
		expect(diasParaVencer({ plan: 'pro', plan_vence_at: enDias(9) }, AHORA)).toBe(9);
		expect(diasParaVencer({ plan: 'pro', plan_vence_at: null }, AHORA)).toBeNull();
		expect(diasParaVencer({ plan: 'free', plan_vence_at: null }, AHORA)).toBeNull();
	});

	it('avisa desde 15 días antes', () => {
		expect(vencePronto({ plan: 'pro', plan_vence_at: enDias(15) }, AHORA)).toBe(true);
		expect(vencePronto({ plan: 'pro', plan_vence_at: enDias(16) }, AHORA)).toBe(false);
		expect(vencePronto({ plan: 'pro', plan_vence_at: null }, AHORA)).toBe(false);
	});
});

describe('isPlan', () => {
	it('reconoce solo los planes del enum', () => {
		expect(isPlan('free')).toBe(true);
		expect(isPlan('pro')).toBe(true);
		expect(isPlan('PRO')).toBe(false);
		expect(isPlan(null)).toBe(false);
	});
});
