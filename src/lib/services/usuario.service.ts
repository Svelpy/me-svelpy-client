import { http } from '#lib/config/http.config.ts';
import type {
	PaginatedResponse,
	UsuarioCreateRequest,
	UsuarioCreateResponse,
	UsuarioFiltros,
	UsuarioListItem,
	UsuarioPasswordRequest,
	UsuarioUpdateRequest
} from '#lib/interfaces/index.ts';
import { buildPaginationQuery } from '#lib/utils/pagination.ts';

/** Cuentas del panel (solo superadmin) */
class UsuarioService {
	/** `GET /usuarios` */
	listar(filtros: UsuarioFiltros = {}): Promise<PaginatedResponse<UsuarioListItem>> {
		const query = buildPaginationQuery(filtros);
		if (filtros.q) query.set('q', filtros.q);
		if (filtros.rol) query.set('rol', filtros.rol);
		if (filtros.estado) query.set('estado', filtros.estado);
		if (filtros.plan) query.set('plan', filtros.plan);
		return http.get(`/usuarios?${query}`);
	}

	/** `GET /usuarios/{id}` */
	obtener(id: string): Promise<UsuarioListItem> {
		return http.get(`/usuarios/${id}`);
	}

	/** `POST /usuarios`: con `tarjeta`, crea también su tarjeta completa en la misma petición */
	crear(datos: UsuarioCreateRequest): Promise<UsuarioCreateResponse> {
		return http.post('/usuarios', datos);
	}

	/** `PATCH /usuarios/{id}` */
	actualizar(id: string, datos: UsuarioUpdateRequest): Promise<UsuarioListItem> {
		return http.patch(`/usuarios/${id}`, datos);
	}

	/** `PUT /usuarios/{id}/password`: cierra las sesiones de esa cuenta */
	async restablecerPassword(id: string, datos: UsuarioPasswordRequest): Promise<void> {
		await http.put(`/usuarios/${id}/password`, datos);
	}

	/** `DELETE /usuarios/{id}`: borrado lógico de la cuenta y de su tarjeta */
	async eliminar(id: string): Promise<void> {
		await http.delete(`/usuarios/${id}`);
	}
}

export const usuarioService = new UsuarioService();
