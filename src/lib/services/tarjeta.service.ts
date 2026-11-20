import { http } from '#lib/config/http.config.ts';
import type {
	PaginatedResponse,
	SlugDisponibilidad,
	Tarjeta,
	TarjetaCompleta,
	TarjetaCreateRequest,
	TarjetaFiltros,
	TarjetaListItem,
	TarjetaNuevaRequest,
	TarjetaPublica,
	TarjetaUpdateRequest
} from '#lib/interfaces/index.ts';
import { buildPaginationQuery } from '#lib/utils/pagination.ts';

/** Tarjetas: directorio (superadmin), la del owner, la pública y su publicación */
class TarjetaService {
	/** `GET /tarjetas` (superadmin) */
	listar(filtros: TarjetaFiltros = {}): Promise<PaginatedResponse<TarjetaListItem>> {
		const query = buildPaginationQuery(filtros);
		if (filtros.q) query.set('q', filtros.q);
		if (filtros.rubro) query.set('rubro', filtros.rubro);
		if (filtros.estado) query.set('estado', filtros.estado);
		return http.get(`/tarjetas?${query}`);
	}

	/** `GET /tarjetas/mia`: toda la tarjeta del owner en una sola respuesta (404 si aún no tiene) */
	obtenerMia(): Promise<TarjetaCompleta> {
		return http.get('/tarjetas/mia');
	}

	/** `POST /tarjetas/mia`: el owner crea su tarjeta, con contenido anidado si lo trae */
	crearMia(datos: TarjetaNuevaRequest): Promise<TarjetaCompleta> {
		return http.post('/tarjetas/mia', datos);
	}

	/** `GET /tarjetas/{id}` */
	obtener(id: string): Promise<TarjetaCompleta> {
		return http.get(`/tarjetas/${id}`);
	}

	/** `POST /tarjetas` (superadmin): tarjeta para una cuenta que aún no tiene */
	crear(datos: TarjetaCreateRequest): Promise<TarjetaCompleta> {
		return http.post('/tarjetas', datos);
	}

	/** `PATCH /tarjetas/{id}` */
	actualizar(id: string, datos: TarjetaUpdateRequest): Promise<Tarjeta> {
		return http.patch(`/tarjetas/${id}`, datos);
	}

	/** `PATCH /tarjetas/{id}/publicacion` */
	publicar(id: string, isPublic: boolean): Promise<Tarjeta> {
		return http.patch(`/tarjetas/${id}/publicacion`, { is_public: isPublic });
	}

	/** `DELETE /tarjetas/{id}` (superadmin, borrado lógico) */
	async eliminar(id: string): Promise<void> {
		await http.delete(`/tarjetas/${id}`);
	}

	/** `GET /tarjetas/slug-disponible` */
	slugDisponible(slug: string, excluirId?: string): Promise<SlugDisponibilidad> {
		const query = new URLSearchParams({ slug });
		if (excluirId) query.set('excluir', excluirId);
		return http.get(`/tarjetas/slug-disponible?${query}`);
	}

	/** `GET /public/slug-disponible`: para el registro, sin sesión */
	slugDisponiblePublico(slug: string): Promise<SlugDisponibilidad> {
		return http.getPublic(`/public/slug-disponible?${new URLSearchParams({ slug })}`);
	}

	/** `GET /public/tarjetas/{slug}`: lo que ve cualquier visitante (sin sesión) */
	obtenerPublica(slug: string): Promise<TarjetaPublica> {
		return http.getPublic(`/public/tarjetas/${encodeURIComponent(slug)}`);
	}
}

export const tarjetaService = new TarjetaService();
