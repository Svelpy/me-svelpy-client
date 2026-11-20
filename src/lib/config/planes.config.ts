/**
 * Planes de una cuenta (enum `plan` de `database-models.md`; espejo del backend, cambiar ambos).
 *
 * - free: arma y edita su tarjeta completa, pero no puede publicarla.
 * - pro: puede publicarla. Con `plan_vence_at`, al vencer la cuenta vuelve a free y su tarjeta
 *   pasa a borrador (lo hace el backend; aquí solo se lee).
 *
 * El plan es otra dimensión que el rol: los permisos por rol siguen en `permissions.config.ts`.
 */
export enum Plan {
	FREE = 'free',
	PRO = 'pro'
}

export const PLANES = [Plan.FREE, Plan.PRO] as const;

/** Lo que habilita cada plan. Los límites futuros (ítems de vitrina, dominio propio…) van aquí */
export const PLAN_LIMITES: Record<Plan, { publicar: boolean }> = {
	[Plan.FREE]: { publicar: false },
	[Plan.PRO]: { publicar: true }
};

/** Días antes del vencimiento en que el panel empieza a avisar */
export const DIAS_AVISO_VENCIMIENTO = 15;

/** Lo mínimo de una cuenta para saber su plan */
export interface CuentaConPlan {
	plan: string;
	plan_vence_at: string | null;
}

export function isPlan(valor: unknown): valor is Plan {
	return PLANES.includes(valor as Plan);
}

/**
 * El plan que rige ahora: un pro vencido cuenta como free aunque el backend todavía no lo haya
 * bajado. Lo desconocido se trata como free (no da permisos).
 */
export function planVigente(cuenta: CuentaConPlan, ahora: Date = new Date()): Plan {
	if (cuenta.plan !== Plan.PRO) return Plan.FREE;
	if (cuenta.plan_vence_at && Date.parse(cuenta.plan_vence_at) <= ahora.getTime()) return Plan.FREE;
	return Plan.PRO;
}

export function puedePublicar(cuenta: CuentaConPlan, ahora: Date = new Date()): boolean {
	return PLAN_LIMITES[planVigente(cuenta, ahora)].publicar;
}

/** Medianoche local del día de `fecha` */
const inicioDelDia = (fecha: Date) =>
	new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();

/**
 * Días de calendario (hora local) hasta el día en que vence un plan pro: 0 = vence hoy.
 * null si no vence o no es pro.
 */
export function diasParaVencer(cuenta: CuentaConPlan, ahora: Date = new Date()): number | null {
	if (planVigente(cuenta, ahora) !== Plan.PRO || !cuenta.plan_vence_at) return null;
	const vence = new Date(cuenta.plan_vence_at);
	return Math.max(0, Math.round((inicioDelDia(vence) - inicioDelDia(ahora)) / 86_400_000));
}

/** Un pro que vence dentro de `DIAS_AVISO_VENCIMIENTO` días */
export function vencePronto(cuenta: CuentaConPlan, ahora: Date = new Date()): boolean {
	const dias = diasParaVencer(cuenta, ahora);
	return dias !== null && dias <= DIAS_AVISO_VENCIMIENTO;
}
