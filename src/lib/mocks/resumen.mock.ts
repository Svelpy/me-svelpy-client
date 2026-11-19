import { Role } from '#lib/config/permissions.config.ts';
import type { ResumenAdmin } from '#lib/interfaces/index.ts';
import { error, esSuperadmin, exigirSesion, type RutaMock } from './db/contexto';
import { db } from './db/tablas';
import { itemDeLista } from './modelos/tarjeta.mock';

/** `GET /resumen/admin`: cifras del inicio del superadmin */

function resumen(): ResumenAdmin {
	const tarjetas = db.tarjetas.activas();
	const conTarjeta = new Set(tarjetas.map((t) => t.user_id));
	const activos = db.usuarios.donde((u) => u.is_active);

	const porRubro = new Map<string, number>();
	for (const tarjeta of tarjetas)
		porRubro.set(tarjeta.rubro, (porRubro.get(tarjeta.rubro) ?? 0) + 1);

	return {
		totales: {
			tarjetas: tarjetas.length,
			publicadas: tarjetas.filter((t) => t.is_public).length,
			borradores: tarjetas.filter((t) => !t.is_public).length,
			usuarios_activos: activos.length,
			usuarios_sin_tarjeta: activos.filter((u) => u.rol === Role.OWNER && !conTarjeta.has(u.id))
				.length
		},
		por_rubro: [...porRubro]
			.map(([rubro, total]) => ({ rubro, total }))
			.sort((a, b) => b.total - a.total || a.rubro.localeCompare(b.rubro))
			.slice(0, 8),
		recientes: [...tarjetas]
			.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
			.slice(0, 6)
			.map(itemDeLista)
	};
}

export const resumenRutas: RutaMock[] = [
	{
		metodo: 'GET',
		patron: '/resumen/admin',
		manejar: (ctx) => {
			if (!esSuperadmin(exigirSesion(ctx))) throw error.prohibido();
			return resumen();
		}
	}
];
