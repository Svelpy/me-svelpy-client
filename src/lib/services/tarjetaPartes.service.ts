import { http } from '#lib/config/http.config.ts';
import type {
	TarjetaSeo,
	TarjetaSeoUpdateRequest,
	TarjetaTheme,
	TarjetaThemeUpdateRequest,
	VitrinaCompleta,
	VitrinaUpdateRequest
} from '#lib/interfaces/index.ts';

/**
 * Las tres extensiones 1:1 de la tarjeta, cada una con su PATCH. Comparten el id de la tarjeta.
 */

class TarjetaThemeService {
	/**
	 * `PATCH /tarjeta-themes/{id}`: solo lo que cambió. Cambiar un valor del preset deja el theme
	 * como personalizado (preset null); cambiar la tipografía no.
	 */
	actualizar(id: string, datos: TarjetaThemeUpdateRequest): Promise<TarjetaTheme> {
		return http.patch(`/tarjeta-themes/${id}`, datos);
	}
}

class TarjetaSeoService {
	/** `PATCH /tarjeta-seos/{id}`: null en título o descripción los genera el frontend */
	actualizar(id: string, datos: TarjetaSeoUpdateRequest): Promise<TarjetaSeo> {
		return http.patch(`/tarjeta-seos/${id}`, datos);
	}
}

class VitrinaService {
	/**
	 * `PATCH /vitrinas/{id}`: configuración, categorías e ítems. Las listas enviadas son el estado
	 * final (máximo 10 categorías, 25 ítems y 3 imágenes por ítem).
	 */
	actualizar(id: string, datos: VitrinaUpdateRequest): Promise<VitrinaCompleta> {
		return http.patch(`/vitrinas/${id}`, datos);
	}
}

export const tarjetaThemeService = new TarjetaThemeService();
export const tarjetaSeoService = new TarjetaSeoService();
export const vitrinaService = new VitrinaService();
