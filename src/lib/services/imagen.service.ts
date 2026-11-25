import { http } from '#lib/config/http.config.ts';
import type {
	ImagenesHuerfanasResponse,
	ImagenTipo,
	ImagenUploadResponse
} from '#lib/interfaces/index.ts';
import { prepararImagen } from '#lib/utils/imagen.ts';

class ImagenService {
	/**
	 * `POST /imagenes/uploads`: la achica según su uso, la sube y devuelve su URL, que después se
	 * envía en el campo de imagen de un create o un update.
	 */
	async subir(archivo: File, tipo: ImagenTipo): Promise<ImagenUploadResponse> {
		const imagen = await prepararImagen(archivo, tipo);
		const datos = new FormData();
		datos.append('file', imagen);
		return http.post('/imagenes/uploads', datos, { requireAuth: true, timeout: 60_000 });
	}

	/** `POST /imagenes/limpiar-huerfanas`: lo mismo que el cron, a pedido de un admin */
	limpiarHuerfanas(): Promise<ImagenesHuerfanasResponse> {
		return http.post('/imagenes/limpiar-huerfanas');
	}
}

export const imagenService = new ImagenService();
