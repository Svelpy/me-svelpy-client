import { http } from '#lib/config/http.config.ts';
import type { ReordenarRequest } from '#lib/interfaces/index.ts';

/**
 * Endpoints REST de una lista que cuelga de un padre (contactos de una tarjeta, categorías de una
 * vitrina…): `GET/POST {coleccion}`, `PUT {coleccion}/orden`, `PATCH/DELETE {elemento}`.
 */
export function servicioLista<Entidad, Crear, Actualizar>(rutas: {
	coleccion: (padreId: string) => string;
	elemento: (id: string) => string;
}) {
	return {
		listar(padreId: string): Promise<Entidad[]> {
			return http.get<Entidad[]>(rutas.coleccion(padreId));
		},
		crear(padreId: string, datos: Crear): Promise<Entidad> {
			return http.post<Entidad>(rutas.coleccion(padreId), datos);
		},
		actualizar(id: string, datos: Actualizar): Promise<Entidad> {
			return http.patch<Entidad>(rutas.elemento(id), datos);
		},
		async eliminar(id: string): Promise<void> {
			await http.delete(rutas.elemento(id));
		},
		/** Todos los ids del padre en el orden nuevo; devuelve la lista ordenada */
		reordenar(padreId: string, ids: string[]): Promise<Entidad[]> {
			const cuerpo: ReordenarRequest = { ids };
			return http.put<Entidad[]>(`${rutas.coleccion(padreId)}/orden`, cuerpo);
		}
	};
}
