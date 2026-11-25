import { estadoPlan, type CuentaConPlan } from '#lib/config/planes.config.ts';
import { APP_SITE_CONFIG } from '#lib/constants/assets.ts';
import { whatsappUrl } from './contacto';
import { urlPublicaTarjeta } from './urlPublica';

/** Fechas, montos y textos del plan de una cuenta para el panel */

/** "12 de diciembre de 2026" (en hora local, no en UTC) */
export function formatVencimiento(iso: string): string {
	return new Date(iso).toLocaleDateString('es-ES', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

/** "12 dic 2026": para tablas */
export function formatFechaCorta(iso: string): string {
	return new Date(iso).toLocaleDateString('es-ES', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

/** "en 9 días", "mañana", "hoy" */
export function textoDiasRestantes(dias: number): string {
	if (dias <= 0) return 'hoy';
	if (dias === 1) return 'mañana';
	return `en ${dias} días`;
}

/** "Pro hasta el 12 de diciembre de 2026", "Pro, venció el …" o "Free" */
export function descripcionPlan(cuenta: CuentaConPlan, ahora: Date = new Date()): string {
	const estado = estadoPlan(cuenta, ahora);
	if (estado.tipo === 'free') return cuenta.plan.nombre;
	const fecha = formatVencimiento(cuenta.plan_vence_at);
	return estado.tipo === 'vencido'
		? `${cuenta.plan.nombre}, venció el ${fecha}`
		: `${cuenta.plan.nombre} hasta el ${fecha}`;
}

/** "80 USD", "Bs 250", "1.200,50 USD": el monto decimal que manda la API con su moneda */
export function formatearMonto(monto: string | number, moneda: string): string {
	const valor = typeof monto === 'number' ? monto : Number(monto);
	if (!Number.isFinite(valor)) return `${monto} ${moneda}`;
	try {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency: moneda,
			minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
			maximumFractionDigits: 2
		}).format(valor);
	} catch {
		return `${valor} ${moneda}`;
	}
}

/** "1 año", "6 meses", "30 días" */
export function formatDuracion(dias: number): string {
	if (dias % 365 === 0) return dias === 365 ? '1 año' : `${dias / 365} años`;
	if (dias % 30 === 0) return dias === 30 ? '1 mes' : `${dias / 30} meses`;
	return dias === 1 ? '1 día' : `${dias} días`;
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
