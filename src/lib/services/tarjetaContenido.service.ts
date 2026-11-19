import { http } from '#lib/config/http.config.ts';
import type {
	ResumenAdmin,
	TarjetaCertificacion,
	TarjetaCertificacionCreateRequest,
	TarjetaCertificacionUpdateRequest,
	TarjetaContacto,
	TarjetaContactoCreateRequest,
	TarjetaContactoUpdateRequest,
	TarjetaEducacion,
	TarjetaEducacionCreateRequest,
	TarjetaEducacionUpdateRequest,
	TarjetaFaq,
	TarjetaFaqCreateRequest,
	TarjetaFaqUpdateRequest,
	TarjetaSeccion,
	TarjetaSeccionUpdateRequest,
	TarjetaSeccionesUpdateRequest,
	TarjetaSeo,
	TarjetaSeoUpdateRequest,
	TarjetaSocial,
	TarjetaSocialCreateRequest,
	TarjetaSocialUpdateRequest,
	TarjetaTheme,
	TarjetaThemeUpdateRequest,
	TarjetaUbicacion,
	TarjetaUbicacionCreateRequest,
	TarjetaUbicacionUpdateRequest,
	UbicacionHorario,
	UbicacionHorarioInput,
	UploadResponse,
	UploadTipo,
	Vitrina,
	VitrinaCategoria,
	VitrinaCategoriaCreateRequest,
	VitrinaCategoriaUpdateRequest,
	VitrinaCompleta,
	VitrinaItem,
	VitrinaItemCreateRequest,
	VitrinaItemImagen,
	VitrinaItemImagenCreateRequest,
	VitrinaItemUpdateRequest,
	VitrinaUpdateRequest
} from '#lib/interfaces/index.ts';
import { servicioLista } from './servicioLista';

/** Servicios de cada parte de una tarjeta (un objeto por modelo) y de archivos y resumen */

/** `tarjeta_theme`: uno por tarjeta, se reemplaza completo */
export const tarjetaThemeService = {
	obtener: (tarjetaId: string): Promise<TarjetaTheme> => http.get(`/tarjetas/${tarjetaId}/theme`),
	actualizar: (tarjetaId: string, datos: TarjetaThemeUpdateRequest): Promise<TarjetaTheme> =>
		http.put(`/tarjetas/${tarjetaId}/theme`, datos)
};

/** `tarjeta_seo`: uno por tarjeta, se reemplaza completo */
export const tarjetaSeoService = {
	obtener: (tarjetaId: string): Promise<TarjetaSeo> => http.get(`/tarjetas/${tarjetaId}/seo`),
	actualizar: (tarjetaId: string, datos: TarjetaSeoUpdateRequest): Promise<TarjetaSeo> =>
		http.put(`/tarjetas/${tarjetaId}/seo`, datos)
};

/** `tarjeta_seccion`: las 9 secciones; orden, visibilidad y título */
export const tarjetaSeccionService = {
	listar: (tarjetaId: string): Promise<TarjetaSeccion[]> =>
		http.get(`/tarjetas/${tarjetaId}/secciones`),
	actualizarTodas: (
		tarjetaId: string,
		datos: TarjetaSeccionesUpdateRequest
	): Promise<TarjetaSeccion[]> => http.put(`/tarjetas/${tarjetaId}/secciones`, datos),
	actualizar: (id: string, datos: TarjetaSeccionUpdateRequest): Promise<TarjetaSeccion> =>
		http.patch(`/secciones/${id}`, datos)
};

/** `tarjeta_contacto` */
export const tarjetaContactoService = servicioLista<
	TarjetaContacto,
	TarjetaContactoCreateRequest,
	TarjetaContactoUpdateRequest
>({
	coleccion: (tarjetaId) => `/tarjetas/${tarjetaId}/contactos`,
	elemento: (id) => `/contactos/${id}`
});

/** `tarjeta_ubicacion` (con sus horarios) y `ubicacion_horario` */
export const tarjetaUbicacionService = {
	...servicioLista<TarjetaUbicacion, TarjetaUbicacionCreateRequest, TarjetaUbicacionUpdateRequest>({
		coleccion: (tarjetaId) => `/tarjetas/${tarjetaId}/ubicaciones`,
		elemento: (id) => `/ubicaciones/${id}`
	}),
	/** `PUT /ubicaciones/{id}/horarios`: reemplaza la semana completa */
	reemplazarHorarios: (
		ubicacionId: string,
		horarios: UbicacionHorarioInput[]
	): Promise<UbicacionHorario[]> => http.put(`/ubicaciones/${ubicacionId}/horarios`, { horarios }),
	crearHorario: (ubicacionId: string, horario: UbicacionHorarioInput): Promise<UbicacionHorario> =>
		http.post(`/ubicaciones/${ubicacionId}/horarios`, horario),
	eliminarHorario: async (id: string): Promise<void> => {
		await http.delete(`/horarios/${id}`);
	}
};

/** `tarjeta_social` */
export const tarjetaSocialService = servicioLista<
	TarjetaSocial,
	TarjetaSocialCreateRequest,
	TarjetaSocialUpdateRequest
>({
	coleccion: (tarjetaId) => `/tarjetas/${tarjetaId}/redes`,
	elemento: (id) => `/redes/${id}`
});

/** `vitrina`: configuración (una por tarjeta) */
export const vitrinaService = {
	obtener: (tarjetaId: string): Promise<VitrinaCompleta> =>
		http.get(`/tarjetas/${tarjetaId}/vitrina`),
	actualizar: (tarjetaId: string, datos: VitrinaUpdateRequest): Promise<Vitrina> =>
		http.put(`/tarjetas/${tarjetaId}/vitrina`, datos)
};

/** `vitrina_categoria` */
export const vitrinaCategoriaService = servicioLista<
	VitrinaCategoria,
	VitrinaCategoriaCreateRequest,
	VitrinaCategoriaUpdateRequest
>({
	coleccion: (vitrinaId) => `/vitrinas/${vitrinaId}/categorias`,
	elemento: (id) => `/vitrina-categorias/${id}`
});

/** `vitrina_item` (con sus imágenes) y `vitrina_item_imagen` */
export const vitrinaItemService = {
	...servicioLista<VitrinaItem, VitrinaItemCreateRequest, VitrinaItemUpdateRequest>({
		coleccion: (vitrinaId) => `/vitrinas/${vitrinaId}/items`,
		elemento: (id) => `/vitrina-items/${id}`
	}),
	agregarImagen: (
		itemId: string,
		imagen: VitrinaItemImagenCreateRequest
	): Promise<VitrinaItemImagen> => http.post(`/vitrina-items/${itemId}/imagenes`, imagen),
	eliminarImagen: async (id: string): Promise<void> => {
		await http.delete(`/vitrina-item-imagenes/${id}`);
	},
	reordenarImagenes: (itemId: string, ids: string[]): Promise<VitrinaItemImagen[]> =>
		http.put(`/vitrina-items/${itemId}/imagenes/orden`, { ids })
};

/** `tarjeta_educacion` */
export const tarjetaEducacionService = servicioLista<
	TarjetaEducacion,
	TarjetaEducacionCreateRequest,
	TarjetaEducacionUpdateRequest
>({
	coleccion: (tarjetaId) => `/tarjetas/${tarjetaId}/educacion`,
	elemento: (id) => `/educacion/${id}`
});

/** `tarjeta_certificacion` */
export const tarjetaCertificacionService = servicioLista<
	TarjetaCertificacion,
	TarjetaCertificacionCreateRequest,
	TarjetaCertificacionUpdateRequest
>({
	coleccion: (tarjetaId) => `/tarjetas/${tarjetaId}/certificaciones`,
	elemento: (id) => `/certificaciones/${id}`
});

/** `tarjeta_faq` */
export const tarjetaFaqService = servicioLista<
	TarjetaFaq,
	TarjetaFaqCreateRequest,
	TarjetaFaqUpdateRequest
>({
	coleccion: (tarjetaId) => `/tarjetas/${tarjetaId}/faq`,
	elemento: (id) => `/faq/${id}`
});

/** `POST /uploads`: sube una imagen y devuelve su URL pública */
export const uploadService = {
	subir(archivo: File, tipo: UploadTipo): Promise<UploadResponse> {
		const cuerpo = new FormData();
		cuerpo.append('archivo', archivo);
		cuerpo.append('tipo', tipo);
		return http.post('/uploads', cuerpo);
	}
};

/** `GET /resumen/admin`: inicio del superadmin */
export const resumenService = {
	admin: (): Promise<ResumenAdmin> => http.get('/resumen/admin')
};
