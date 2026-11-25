import { conQuery } from '#lib/config/api.config.ts';
import { http } from '#lib/config/http.config.ts';
import type {
	PaginatedResponse,
	UsuarioCreateRequest,
	UsuarioDetalle,
	UsuarioFiltros,
	UsuarioListItem,
	UsuarioMe,
	UsuarioUpdateMeRequest,
	UsuarioUpdateRequest
} from '#lib/interfaces/index.ts';

/** Cuentas: la propia (`/usuarios/me`) y, para admin y superadmin, las de todos */
class UsuarioService {
	/** `GET /usuarios/me`: mi usuario, mi plan y mi tarjeta completa (null si no tengo) */
	me(): Promise<UsuarioMe> {
		return http.get('/usuarios/me', { requireAuth: true });
	}

	/** `PATCH /usuarios/me`: cambiar el email lo deja sin verificar hasta usar el enlace */
	actualizarMe(datos: UsuarioUpdateMeRequest): Promise<UsuarioDetalle> {
		return http.patch('/usuarios/me', datos, { requireAuth: true });
	}

	/** `GET /usuarios/` */
	listar(filtros: UsuarioFiltros = {}): Promise<PaginatedResponse<UsuarioListItem>> {
		const { page, per_page, rol, plan_id, is_active } = filtros;
		return http.get(conQuery('/usuarios/', { page, per_page, rol, plan_id, is_active }));
	}

	/** `GET /usuarios/{id}` */
	obtener(id: string): Promise<UsuarioDetalle> {
		return http.get(`/usuarios/${id}`);
	}

	/** `POST /usuarios/`: solo roles inferiores al de quien crea; empieza con el plan free */
	crear(datos: UsuarioCreateRequest): Promise<UsuarioDetalle> {
		return http.post('/usuarios/', { ...datos, email: datos.email.trim().toLowerCase() });
	}

	/** `PATCH /usuarios/{id}` (email y rol) */
	actualizar(id: string, datos: UsuarioUpdateRequest): Promise<UsuarioDetalle> {
		return http.patch(`/usuarios/${id}`, datos);
	}

	/** `DELETE /usuarios/{id}`: 409 si tiene pagos o tarjeta (en ese caso se da de baja) */
	async eliminar(id: string): Promise<void> {
		await http.delete(`/usuarios/${id}`);
	}

	/** `POST /usuarios/{id}/dar-de-baja`: no inicia sesión, se revocan sus sesiones y se despublica su tarjeta */
	darDeBaja(id: string): Promise<UsuarioDetalle> {
		return http.post(`/usuarios/${id}/dar-de-baja`);
	}

	/** `POST /usuarios/{id}/reactivar`: su tarjeta sigue despublicada hasta que la vuelva a publicar */
	reactivar(id: string): Promise<UsuarioDetalle> {
		return http.post(`/usuarios/${id}/reactivar`);
	}
}

export const usuarioService = new UsuarioService();
