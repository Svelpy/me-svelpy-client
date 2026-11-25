/**
 * Planes de una cuenta. El catálogo vive en la API (`GET /planes/`): cada cuenta tiene un
 * `plan_id`, su `plan` y `plan_vence_at` (siempre con valor). Los códigos son estables:
 *
 * - free: arma y edita su tarjeta completa, pero no puede publicarla.
 * - pro (o cualquier plan pago): la publica mientras `plan_vence_at` no pase. Al vencer, el backend
 *   despublica la tarjeta; aquí solo se lee.
 *
 * El plan es otra dimensión que el rol: los permisos por rol siguen en `permissions.config.ts`.
 */

/** Código del plan gratuito */
export const PLAN_FREE = 'free';
/** Código del plan pago que se ofrece */
export const PLAN_PRO = 'pro';

/** Días antes del vencimiento en que el panel empieza a avisar */
export const DIAS_AVISO_VENCIMIENTO = 15;

/** El plan tal como llega: completo (`codigo`) o como referencia (solo `nombre`) */
export interface PlanDeCuenta {
	codigo?: string | null;
	nombre: string;
}

/** Lo mínimo de una cuenta para saber su plan */
export interface CuentaConPlan {
	plan: PlanDeCuenta;
	plan_vence_at: string;
}

/** Lo mínimo para saber si el dueño de una tarjeta puede publicarla */
export interface CuentaPublicadora extends CuentaConPlan {
	is_active: boolean;
	email_verified_at: string | null;
}

/** Código del plan; si solo llegó la referencia, se deduce del nombre */
export function codigoDePlan(plan: PlanDeCuenta): string {
	return (plan.codigo ?? plan.nombre).trim().toLowerCase();
}

export function esPlanFree(cuenta: CuentaConPlan): boolean {
	return codigoDePlan(cuenta.plan) === PLAN_FREE;
}

/** El vencimiento ya pasó */
export function planVencido(cuenta: CuentaConPlan, ahora: Date = new Date()): boolean {
	return Date.parse(cuenta.plan_vence_at) <= ahora.getTime();
}

/** Medianoche local del día de `fecha` */
const inicioDelDia = (fecha: Date) =>
	new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();

/**
 * Días de calendario (hora local) hasta el día en que vence un plan pago vigente: 0 = vence hoy.
 * null si es free o ya venció.
 */
export function diasParaVencer(cuenta: CuentaConPlan, ahora: Date = new Date()): number | null {
	if (esPlanFree(cuenta) || planVencido(cuenta, ahora)) return null;
	const vence = new Date(cuenta.plan_vence_at);
	return Math.max(0, Math.round((inicioDelDia(vence) - inicioDelDia(ahora)) / 86_400_000));
}

/** Un plan pago que vence dentro de `DIAS_AVISO_VENCIMIENTO` días */
export function vencePronto(cuenta: CuentaConPlan, ahora: Date = new Date()): boolean {
	const dias = diasParaVencer(cuenta, ahora);
	return dias !== null && dias <= DIAS_AVISO_VENCIMIENTO;
}

export type EstadoPlan =
	{ tipo: 'free' } | { tipo: 'vigente'; dias: number; vencePronto: boolean } | { tipo: 'vencido' };

/** Estado del plan para la UI: Free, vigente (y si vence pronto) o vencido */
export function estadoPlan(cuenta: CuentaConPlan, ahora: Date = new Date()): EstadoPlan {
	if (esPlanFree(cuenta)) return { tipo: 'free' };
	const dias = diasParaVencer(cuenta, ahora);
	if (dias === null) return { tipo: 'vencido' };
	return { tipo: 'vigente', dias, vencePronto: dias <= DIAS_AVISO_VENCIMIENTO };
}

/** Por qué una tarjeta no se puede publicar (lo mismo que exige `POST /tarjetas/{id}/publicar`) */
export type BloqueoPublicacion =
	'cuenta-de-baja' | 'plan-free' | 'plan-vencido' | 'email-sin-verificar';

/** El primer motivo que impide publicar, o null si se puede */
export function bloqueoPublicacion(
	cuenta: CuentaPublicadora,
	ahora: Date = new Date()
): BloqueoPublicacion | null {
	if (!cuenta.is_active) return 'cuenta-de-baja';
	if (esPlanFree(cuenta)) return 'plan-free';
	if (planVencido(cuenta, ahora)) return 'plan-vencido';
	if (!cuenta.email_verified_at) return 'email-sin-verificar';
	return null;
}

export function puedePublicar(cuenta: CuentaPublicadora, ahora: Date = new Date()): boolean {
	return bloqueoPublicacion(cuenta, ahora) === null;
}
