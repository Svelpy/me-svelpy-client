import type { Timestamps } from './common.interface';
import type { PaginationParams } from './pagination.interface';
import type { Plan, PlanRef } from './plan.interface';
import type { Usuario, UsuarioRef } from './usuario.interface';

/** Enum `MetodoPago` */
export type MetodoPago = 'qr' | 'transferencia' | 'tarjeta' | 'efectivo' | 'otro';

/** Columnas de un pago. Una anulación es otra fila con `reverses_id` apuntando al pago anulado */
export interface PagoBase extends Timestamps {
	id: string;
	user_id: string;
	plan_id: string;
	/** Decimal como texto; negativo en una anulación */
	monto: string;
	moneda: string;
	metodo: MetodoPago;
	referencia_externa: string | null;
	comprobante_url: string | null;
	/** Periodo que este pago sumó al plan */
	periodo_inicio: string;
	periodo_fin: string;
	/** En una anulación, el pago que revierte */
	reverses_id: string | null;
	idempotency_key: string;
}

/** Item de `GET /pagos/` (`PagoResponseItemList`) */
export interface PagoListItem extends PagoBase {
	user: UsuarioRef;
	plan: PlanRef;
}

/** `PagoResponseDetail` */
export interface PagoDetalle extends PagoBase {
	user: Usuario;
	plan: Plan;
}

/**
 * `POST /pagos/registrar` (`PagoCreate`): renueva el plan del usuario. Sin `monto` se cobra el
 * precio del plan; con monto (una oferta) no puede superarlo. Un reintento con la misma
 * `idempotency_key` devuelve el pago ya registrado.
 */
export interface PagoCreateRequest {
	user_id: string;
	plan_id: string;
	monto?: number | string | null;
	metodo: MetodoPago;
	referencia_externa?: string | null;
	/** URL de `POST /imagenes/uploads` */
	comprobante_url?: string | null;
	/** Máximo 64 caracteres */
	idempotency_key: string;
}

/** Filtros de `GET /pagos/` */
export interface PagoFiltros extends PaginationParams {
	user_id?: string;
	plan_id?: string;
}
