import { Plan, planVigente, type CuentaConPlan } from '#lib/config/planes.config.ts';
import { APP_SITE_CONFIG } from '#lib/constants/assets.ts';
import { whatsappUrl } from './contacto';
import { finDelDia } from './date';
import { urlPublicaTarjeta } from './urlPublica';

/** Fechas y textos del plan de una cuenta para el panel */

/** `AAAA-MM-DD` de un `<input type="date">` → vence al final de ese día (hora local) */
export function fechaAVencimiento(fecha: string): string | null {
	const [anio, mes, dia] = fecha.split('-').map(Number);
	if (!anio || !mes || !dia) return null;
	return finDelDia(new Date(anio, mes - 1, dia));
}

/** Vencimiento ISO → `AAAA-MM-DD` en hora local, para un `<input type="date">` */
export function vencimientoAFecha(iso: string | null): string {
	if (!iso) return '';
	const fecha = new Date(iso);
	if (Number.isNaN(fecha.getTime())) return '';
	const dos = (n: number) => String(n).padStart(2, '0');
	return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

/** "12 de diciembre de 2026" (en hora local, no en UTC) */
export function formatVencimiento(iso: string): string {
	return new Date(iso).toLocaleDateString('es-ES', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

/** "en 9 días", "mañana", "hoy" */
export function textoDiasRestantes(dias: number): string {
	if (dias <= 0) return 'hoy';
	if (dias === 1) return 'mañana';
	return `en ${dias} días`;
}

/** "Pro hasta el 12 de diciembre de 2026", "Pro, sin vencimiento" o "Free" */
export function descripcionPlan(cuenta: CuentaConPlan, ahora: Date = new Date()): string {
	if (planVigente(cuenta, ahora) !== Plan.PRO) return 'Free';
	return cuenta.plan_vence_at
		? `Pro hasta el ${formatVencimiento(cuenta.plan_vence_at)}`
		: 'Pro, sin vencimiento';
}

/** WhatsApp de ventas con el mensaje para activar (o renovar) el plan Pro */
export function urlActivarPro(slug?: string | null, renovar = false): string {
	const accion = renovar ? 'renovar' : 'activar';
	const tarjeta = slug ? ` para mi tarjeta ${urlPublicaTarjeta(slug)}` : '';
	return whatsappUrl(
		APP_SITE_CONFIG.VENTAS_WHATSAPP,
		`Hola, quiero ${accion} el plan Pro de ME${tarjeta}.`
	);
}

/** Los campos del formulario de plan → cuerpo de la API (free nunca lleva vencimiento) */
export function planDelFormulario(
	plan: Plan,
	vence: string
): { plan: Plan; plan_vence_at: string | null } {
	return {
		plan,
		plan_vence_at: plan === Plan.PRO && vence ? fechaAVencimiento(vence) : null
	};
}
