import { conQuery } from '#lib/config/api.config.ts';
import { http } from '#lib/config/http.config.ts';
import type {
	PaginatedResponse,
	SlugDisponibilidad,
	TarjetaCompleta,
	TarjetaCreateRequest,
	TarjetaDetalle,
	TarjetaFiltros,
	TarjetaListItem,
	TarjetaPublica,
	TarjetasDespublicadasResponse,
	TarjetaUpdateRequest
} from '#lib/interfaces/index.ts';

interface OpcionesPublicas {
	/** El `fetch` del `load` de SvelteKit (SSR) */
	fetch?: typeof fetch;
}

/** Tarjetas: directorio, edición, publicación y lectura pública */
class TarjetaService {
	/** `GET /tarjetas/`: un admin ve todas; un user, solo la suya */
	listar(filtros: TarjetaFiltros = {}): Promise<PaginatedResponse<TarjetaListItem>> {
		const { page, per_page, user_id, is_public } = filtros;
		return http.get(conQuery('/tarjetas/', { page, per_page, user_id, is_public }));
	}

	/** `GET /tarjetas/{id}/completa`: todo su árbol, con theme, SEO y vitrina (como la ve su dueño) */
	obtenerCompleta(id: string): Promise<TarjetaCompleta> {
		return http.get(`/tarjetas/${id}/completa`);
	}

	/** `GET /tarjetas/{id}`: sin theme, SEO ni vitrina */
	obtener(id: string): Promise<TarjetaDetalle> {
		return http.get(`/tarjetas/${id}`);
	}

	/**
	 * `POST /tarjetas/`: una por usuario, despublicada. Sin `user_id` es la propia; con `user_id`
	 * (admin) la de otra cuenta.
	 */
	crear(datos: TarjetaCreateRequest): Promise<TarjetaDetalle> {
		return http.post('/tarjetas/', datos);
	}

	/** `PATCH /tarjetas/{id}`: datos y listas (cada lista enviada es el estado final) */
	actualizar(id: string, datos: TarjetaUpdateRequest): Promise<TarjetaDetalle> {
		return http.patch(`/tarjetas/${id}`, datos);
	}

	/** `DELETE /tarjetas/{id}`: borra también todo su árbol */
	async eliminar(id: string): Promise<void> {
		await http.delete(`/tarjetas/${id}`);
	}

	/** `POST /tarjetas/{id}/publicar`: 409 si el dueño está de baja, sin verificar o sin plan vigente */
	publicar(id: string): Promise<TarjetaDetalle> {
		return http.post(`/tarjetas/${id}/publicar`);
	}

	/** `POST /tarjetas/{id}/despublicar` */
	despublicar(id: string): Promise<TarjetaDetalle> {
		return http.post(`/tarjetas/${id}/despublicar`);
	}

	/** `POST /tarjetas/despublicar-vencidas`: lo mismo que el cron, a pedido de un admin */
	despublicarVencidas(): Promise<TarjetasDespublicadasResponse> {
		return http.post('/tarjetas/despublicar-vencidas');
	}

	/**
	 * `GET /tarjetas/public/slug-disponible/{slug}`: con sesión, el slug actual de la tarjeta propia
	 * cuenta como disponible. Un formato inválido responde 422.
	 */
	slugDisponible(slug: string): Promise<SlugDisponibilidad> {
		return http.get(`/tarjetas/public/slug-disponible/${encodeURIComponent(slug)}`);
	}

	/** `GET /tarjetas/public/{slug}`: solo lo visible de una tarjeta publicada */
	obtenerPublica(slug: string, opciones: OpcionesPublicas = {}): Promise<TarjetaPublica> {
		return http.getPublic(`/tarjetas/public/${encodeURIComponent(slug)}`, opciones);
	}

	/** `GET /tarjetas/public/id/{id}`: la que abre el QR (`/t/{id}`) */
	obtenerPublicaPorId(id: string, opciones: OpcionesPublicas = {}): Promise<TarjetaPublica> {
		return http.getPublic(`/tarjetas/public/id/${encodeURIComponent(id)}`, opciones);
	}
}

export const tarjetaService = new TarjetaService();
