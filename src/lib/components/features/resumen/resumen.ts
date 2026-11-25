import { Role } from '#lib/config/permissions.config.ts';
import { PLAN_PRO } from '#lib/config/planes.config.ts';
import type { PagoListItem, TarjetaListItem } from '#lib/interfaces/index.ts';
import { pagoService, tarjetaService, usuarioService } from '#lib/services/index.ts';
import { planesStore } from '#lib/stores/planes.store.ts';

/**
 * Inicio de los admins. La API no tiene un endpoint de resumen: los totales salen del `total` de
 * cada listado pedido con `per_page=1`, todos en paralelo.
 */
export interface ResumenPanel {
	totales: {
		publicadas: number;
		borradores: number;
		/** Cuentas user activas */
		cuentasActivas: number;
		/** Cuentas user con el plan Pro (vigente o vencido); null si el catálogo no tiene Pro */
		cuentasPro: number | null;
	};
	/** Las primeras del directorio */
	tarjetas: TarjetaListItem[];
	/** Los últimos pagos registrados (y anulaciones) */
	pagos: PagoListItem[];
}

export async function cargarResumen(): Promise<ResumenPanel> {
	const pro = (await planesStore.cargar()).find((plan) => plan.codigo === PLAN_PRO);
	const [todas, publicadas, activas, conPro, tarjetas, pagos] = await Promise.all([
		tarjetaService.listar({ per_page: 1 }),
		tarjetaService.listar({ per_page: 1, is_public: true }),
		usuarioService.listar({ per_page: 1, rol: Role.USER, is_active: true }),
		pro ? usuarioService.listar({ per_page: 1, rol: Role.USER, plan_id: pro.id }) : null,
		tarjetaService.listar({ per_page: 6 }),
		pagoService.listar({ per_page: 5 })
	]);
	return {
		totales: {
			publicadas: publicadas.total,
			borradores: Math.max(0, todas.total - publicadas.total),
			cuentasActivas: activas.total,
			cuentasPro: conPro?.total ?? null
		},
		tarjetas: tarjetas.data,
		pagos: pagos.data
	};
}
