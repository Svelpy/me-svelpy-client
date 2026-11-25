import type { PagoBase } from '#lib/interfaces/index.ts';

/** Ayudas para leer pagos: anulaciones, días que sumó y montos */

/** Los pagos de la lista que ya tienen su anulación (una fila con `reverses_id` hacia ellos) */
export function idsAnulados(pagos: Pick<PagoBase, 'reverses_id'>[]): Set<string> {
	return new Set(pagos.map((pago) => pago.reverses_id).filter((id): id is string => !!id));
}

/** Días de calendario entre el inicio y el fin del periodo que sumó un pago */
export function diasDelPeriodo(pago: Pick<PagoBase, 'periodo_inicio' | 'periodo_fin'>): number {
	const dias = (Date.parse(pago.periodo_fin) - Date.parse(pago.periodo_inicio)) / 86_400_000;
	return Number.isFinite(dias) ? Math.max(0, Math.round(dias)) : 0;
}

/** El monto sin signo (una anulación llega negativa) */
export function montoAbsoluto(monto: string): string {
	return monto.replace(/^-/, '');
}

/** Clave única para registrar un pago una sola vez aunque se reintente (máximo 64 caracteres) */
export function nuevaClaveIdempotencia(): string {
	const aleatorio =
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? crypto.randomUUID()
			: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
	return `pago-${aleatorio}`.slice(0, 64);
}
