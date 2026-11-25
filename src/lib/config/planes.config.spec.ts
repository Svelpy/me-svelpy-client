import { describe, expect, it } from 'vitest';
import {
	bloqueoPublicacion,
	codigoDePlan,
	diasParaVencer,
	estadoPlan,
	esPlanFree,
	puedePublicar,
	vencePronto,
	type CuentaPublicadora
} from './planes.config.ts';

const AHORA = new Date('2026-11-19T12:00:00Z');
const enDias = (dias: number) => new Date(AHORA.getTime() + dias * 86_400_000).toISOString();

const PRO = { codigo: 'pro', nombre: 'Pro' };
const FREE = { codigo: 'free', nombre: 'Free' };

const cuenta = (cambios: Partial<CuentaPublicadora> = {}): CuentaPublicadora => ({
	plan: PRO,
	plan_vence_at: enDias(30),
	is_active: true,
	email_verified_at: AHORA.toISOString(),
	...cambios
});

describe('código del plan', () => {
	it('usa el código; si solo llegó la referencia, lo deduce del nombre', () => {
		expect(codigoDePlan(PRO)).toBe('pro');
		expect(codigoDePlan({ nombre: 'Free' })).toBe('free');
		expect(esPlanFree({ plan: FREE, plan_vence_at: enDias(10) })).toBe(true);
		expect(esPlanFree({ plan: { nombre: 'Pro' }, plan_vence_at: enDias(10) })).toBe(false);
	});
});

describe('bloqueoPublicacion', () => {
	it('con plan pago vigente, email verificado y cuenta activa, se publica', () => {
		expect(bloqueoPublicacion(cuenta(), AHORA)).toBeNull();
		expect(puedePublicar(cuenta(), AHORA)).toBe(true);
	});

	it('Free nunca publica, aunque su fecha no haya pasado', () => {
		expect(bloqueoPublicacion(cuenta({ plan: FREE }), AHORA)).toBe('plan-free');
	});

	it('un plan pago vencido no publica', () => {
		expect(bloqueoPublicacion(cuenta({ plan_vence_at: enDias(-1) }), AHORA)).toBe('plan-vencido');
		expect(bloqueoPublicacion(cuenta({ plan_vence_at: AHORA.toISOString() }), AHORA)).toBe(
			'plan-vencido'
		);
	});

	it('sin el email verificado no publica', () => {
		expect(bloqueoPublicacion(cuenta({ email_verified_at: null }), AHORA)).toBe(
			'email-sin-verificar'
		);
	});

	it('una cuenta de baja no publica (es lo primero que se dice)', () => {
		expect(
			bloqueoPublicacion(cuenta({ is_active: false, plan: FREE, email_verified_at: null }), AHORA)
		).toBe('cuenta-de-baja');
	});
});

describe('vencimiento', () => {
	it('cuenta días de calendario hasta el día del vencimiento', () => {
		// En hora local: hoy 10:00 y vence el 28 a las 23:59 → 9 días, aunque sean casi 10 × 24 h
		const hoy = new Date(2026, 10, 19, 10, 0);
		const vence = (dia: number) => new Date(2026, 10, dia, 23, 59, 59).toISOString();
		expect(diasParaVencer({ plan: PRO, plan_vence_at: vence(28) }, hoy)).toBe(9);
		expect(diasParaVencer({ plan: PRO, plan_vence_at: vence(20) }, hoy)).toBe(1);
		expect(diasParaVencer({ plan: PRO, plan_vence_at: vence(19) }, hoy)).toBe(0);
		expect(diasParaVencer({ plan: PRO, plan_vence_at: enDias(9) }, AHORA)).toBe(9);
		expect(diasParaVencer({ plan: PRO, plan_vence_at: enDias(-2) }, AHORA)).toBeNull();
		expect(diasParaVencer({ plan: FREE, plan_vence_at: enDias(9) }, AHORA)).toBeNull();
	});

	it('avisa desde 15 días antes', () => {
		expect(vencePronto({ plan: PRO, plan_vence_at: enDias(15) }, AHORA)).toBe(true);
		expect(vencePronto({ plan: PRO, plan_vence_at: enDias(16) }, AHORA)).toBe(false);
		expect(vencePronto({ plan: FREE, plan_vence_at: enDias(3) }, AHORA)).toBe(false);
	});

	it('resume el estado para la UI', () => {
		expect(estadoPlan({ plan: FREE, plan_vence_at: enDias(3) }, AHORA)).toEqual({ tipo: 'free' });
		expect(estadoPlan({ plan: PRO, plan_vence_at: enDias(-1) }, AHORA)).toEqual({
			tipo: 'vencido'
		});
		expect(estadoPlan({ plan: PRO, plan_vence_at: enDias(9) }, AHORA)).toEqual({
			tipo: 'vigente',
			dias: 9,
			vencePronto: true
		});
	});
});
