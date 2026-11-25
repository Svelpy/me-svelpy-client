import { conQuery } from '#lib/config/api.config.ts';
import { http } from '#lib/config/http.config.ts';
import type {
	PaginatedResponse,
	Plan,
	PlanFiltros,
	PlanPublico,
	PlanUpdateRequest
} from '#lib/interfaces/index.ts';

class PlanService {
	/** `GET /planes/public`: los planes visibles (precios) */
	publicos(): Promise<PlanPublico[]> {
		return http.getPublic('/planes/public');
	}

	/** `GET /planes/` (admin) */
	listar(filtros: PlanFiltros = {}): Promise<PaginatedResponse<Plan>> {
		const { page, per_page, is_visible } = filtros;
		return http.get(conQuery('/planes/', { page, per_page, is_visible }));
	}

	/** `PATCH /planes/{id}`: todo menos el código */
	actualizar(id: string, datos: PlanUpdateRequest): Promise<Plan> {
		return http.patch(`/planes/${id}`, datos);
	}
}

export const planService = new PlanService();
