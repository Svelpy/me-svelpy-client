import { conQuery } from '#lib/config/api.config.ts';
import { http } from '#lib/config/http.config.ts';
import type {
	PaginatedResponse,
	PagoCreateRequest,
	PagoDetalle,
	PagoFiltros,
	PagoListItem
} from '#lib/interfaces/index.ts';

/** Pagos de planes (admin): registrarlos renueva el plan; anularlos lo descuenta */
class PagoService {
	/** `GET /pagos/` */
	listar(filtros: PagoFiltros = {}): Promise<PaginatedResponse<PagoListItem>> {
		const { page, per_page, user_id, plan_id } = filtros;
		return http.get(conQuery('/pagos/', { page, per_page, user_id, plan_id }));
	}

	/** `GET /pagos/{id}` */
	obtener(id: string): Promise<PagoDetalle> {
		return http.get(`/pagos/${id}`);
	}

	/** `POST /pagos/registrar`: un reintento con la misma `idempotency_key` no cobra dos veces */
	registrar(datos: PagoCreateRequest): Promise<PagoDetalle> {
		return http.post('/pagos/registrar', datos);
	}

	/** `POST /pagos/{id}/anular`: inserta el reverso y descuenta los días que había sumado */
	anular(id: string): Promise<PagoDetalle> {
		return http.post(`/pagos/${id}/anular`);
	}
}

export const pagoService = new PagoService();
