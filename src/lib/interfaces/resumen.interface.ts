import type { TarjetaListItem } from './tarjeta.interface';

/** `GET /resumen/admin`: inicio del superadmin */
export interface ResumenAdmin {
	totales: {
		tarjetas: number;
		publicadas: number;
		borradores: number;
		usuarios_activos: number;
		/** Propietarios activos con plan Pro vigente */
		cuentas_pro: number;
		/** Owners activos que todavía no tienen tarjeta */
		usuarios_sin_tarjeta: number;
	};
	/** Rubros con más tarjetas, de mayor a menor */
	por_rubro: { rubro: string; total: number }[];
	/** Últimas tarjetas modificadas */
	recientes: TarjetaListItem[];
}
