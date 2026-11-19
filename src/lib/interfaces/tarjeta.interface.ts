import type { Timestamps } from './common.interface';
import type { PaginationParams } from './pagination.interface';
import type {
	TarjetaCertificacion,
	TarjetaCertificacionCreateRequest
} from './tarjetaCertificacion.interface';
import type { TarjetaContacto, TarjetaContactoCreateRequest } from './tarjetaContacto.interface';
import type { TarjetaEducacion, TarjetaEducacionCreateRequest } from './tarjetaEducacion.interface';
import type { TarjetaFaq, TarjetaFaqCreateRequest } from './tarjetaFaq.interface';
import type { TarjetaSeccion, TarjetaSeccionInput } from './tarjetaSeccion.interface';
import type { TarjetaSeo, TarjetaSeoUpdateRequest } from './tarjetaSeo.interface';
import type { TarjetaSocial, TarjetaSocialCreateRequest } from './tarjetaSocial.interface';
import type { TarjetaTheme, TarjetaThemeUpdateRequest } from './tarjetaTheme.interface';
import type { TarjetaUbicacion, TarjetaUbicacionCreateRequest } from './tarjetaUbicacion.interface';
import type { VitrinaCompleta, VitrinaNuevaRequest } from './vitrina.interface';

/**
 * Dónde se muestra la empresa (logo + nombre) en la cabecera de la tarjeta:
 * arriba = franja superior de la portada; abajo = bajo el cargo;
 * izquierda / derecha = insignia junto a la foto (el nombre va bajo el cargo); oculto = no se muestra.
 */
export type NombreEmpresaPosicion = 'arriba' | 'abajo' | 'izquierda' | 'derecha' | 'oculto';

/** Fila de `tarjeta` tal como la devuelve la API */
export interface Tarjeta extends Timestamps {
	id: string;
	user_id: string;
	/** Dirección pública: me.svelpy.com/{slug} */
	slug: string;
	/** Texto libre; `rubros.config.ts` sugiere valores y deriva el tipo Schema.org */
	rubro: string;
	/** Dr., Dra., Ing., Lic., Arq.… */
	prefijo: string | null;
	nombres: string;
	apellidos: string | null;
	cargo: string | null;
	nombre_empresa: string | null;
	acerca_de_mi: string | null;
	/** Foto de la tarjeta; también la og:image si el SEO no define otra */
	profile_url: string | null;
	/** Foto que se guarda con el contacto (.vcf); si es null se usa `profile_url` */
	photo_usuario_url: string | null;
	logo_empresa_url: string | null;
	nombre_empresa_posicion: NombreEmpresaPosicion;
	cover_url: string | null;
	qr_tarjeta_url: string | null;
	qr_pago_url: string | null;
	is_public: boolean;
	published_at: string | null;
}

/** Datos mínimos de una tarjeta: sesión, header, listados */
export interface TarjetaResumen {
	id: string;
	slug: string;
	prefijo: string | null;
	nombres: string;
	apellidos: string | null;
	cargo: string | null;
	rubro: string;
	profile_url: string | null;
	is_public: boolean;
	published_at: string | null;
	updated_at: string;
}

/** Colores y tipografía que necesita una mini-tarjeta del directorio */
export type TarjetaTemaMini = Pick<
	TarjetaTheme,
	| 'color_fondo'
	| 'color_superficie'
	| 'color_borde'
	| 'color_titulo'
	| 'color_texto_secundario'
	| 'color_primario'
	| 'color_texto_sobre_primario'
	| 'color_overlay_portada'
	| 'overlay_opacidad'
	| 'tipografia'
>;

/** Cuenta dueña de la tarjeta (solo en respuestas para el panel) */
export interface TarjetaPropietario {
	id: string;
	email: string;
	is_active: boolean;
}

/** Item del directorio de tarjetas (`GET /tarjetas`, superadmin) */
export interface TarjetaListItem extends TarjetaResumen {
	nombre_empresa: string | null;
	cover_url: string | null;
	created_at: string;
	tema: TarjetaTemaMini;
	propietario: TarjetaPropietario;
}

/**
 * La tarjeta con todo su contenido, en una sola respuesta: `GET /tarjetas/mia` (owner, justo
 * después del login) y `GET /tarjetas/{id}` (superadmin). Las listas vienen ordenadas por `orden`.
 */
export interface TarjetaCompleta extends Tarjeta {
	theme: TarjetaTheme;
	seo: TarjetaSeo;
	secciones: TarjetaSeccion[];
	contactos: TarjetaContacto[];
	/** Cada una con sus horarios */
	ubicaciones: TarjetaUbicacion[];
	sociales: TarjetaSocial[];
	vitrina: VitrinaCompleta;
	educacion: TarjetaEducacion[];
	certificaciones: TarjetaCertificacion[];
	faq: TarjetaFaq[];
	propietario: TarjetaPropietario;
}

/**
 * `GET /public/tarjetas/{slug}`: lo que ve cualquier visitante. Solo tarjetas publicadas de
 * cuentas activas, solo lo visible (`is_visible`) y sin datos de la cuenta.
 */
export type TarjetaPublica = Omit<TarjetaCompleta, 'propietario' | 'user_id'>;

/**
 * Tarjeta nueva con todo su contenido en una sola petición. La usan `POST /tarjetas/mia` (owner),
 * `POST /tarjetas` (superadmin, con `user_id`) y `POST /usuarios` (anidada en el usuario).
 */
export interface TarjetaNuevaRequest {
	slug: string;
	rubro: string;
	nombres: string;
	prefijo?: string | null;
	apellidos?: string | null;
	cargo?: string | null;
	nombre_empresa?: string | null;
	acerca_de_mi?: string | null;
	profile_url?: string | null;
	photo_usuario_url?: string | null;
	logo_empresa_url?: string | null;
	/** Por defecto 'derecha' */
	nombre_empresa_posicion?: NombreEmpresaPosicion;
	cover_url?: string | null;
	qr_pago_url?: string | null;
	/** Por defecto false (borrador) */
	is_public?: boolean;
	/** Sin tema: los colores del preset que sugiere el rubro */
	theme?: Partial<TarjetaThemeUpdateRequest>;
	seo?: Partial<TarjetaSeoUpdateRequest>;
	/** Sin secciones: las 9, visibles y en el orden por defecto */
	secciones?: TarjetaSeccionInput[];
	contactos?: TarjetaContactoCreateRequest[];
	/** Cada ubicación puede traer sus horarios */
	ubicaciones?: TarjetaUbicacionCreateRequest[];
	sociales?: TarjetaSocialCreateRequest[];
	/** Configuración, categorías e ítems (con imágenes) de la vitrina */
	vitrina?: VitrinaNuevaRequest;
	educacion?: TarjetaEducacionCreateRequest[];
	certificaciones?: TarjetaCertificacionCreateRequest[];
	faq?: TarjetaFaqCreateRequest[];
}

/** `POST /tarjetas` (superadmin): tarjeta para un usuario que aún no tiene */
export interface TarjetaCreateRequest extends TarjetaNuevaRequest {
	user_id: string;
}

/** `PATCH /tarjetas/{id}`. `slug` solo lo acepta el superadmin */
export interface TarjetaUpdateRequest {
	slug?: string;
	rubro?: string;
	prefijo?: string | null;
	nombres?: string;
	apellidos?: string | null;
	cargo?: string | null;
	nombre_empresa?: string | null;
	acerca_de_mi?: string | null;
	profile_url?: string | null;
	photo_usuario_url?: string | null;
	logo_empresa_url?: string | null;
	nombre_empresa_posicion?: NombreEmpresaPosicion;
	cover_url?: string | null;
	qr_pago_url?: string | null;
}

/** `PATCH /tarjetas/{id}/publicacion`. Publicar fija `published_at` la primera vez */
export interface TarjetaPublicacionRequest {
	is_public: boolean;
}

export type TarjetaEstado = 'publicada' | 'borrador';

/** Filtros de `GET /tarjetas` */
export interface TarjetaFiltros extends PaginationParams {
	/** Busca en nombre, slug, rubro, empresa y email del propietario */
	q?: string;
	rubro?: string;
	estado?: TarjetaEstado;
}

/** `GET /tarjetas/slug-disponible?slug=&excluir=` */
export interface SlugDisponibilidad {
	slug: string;
	disponible: boolean;
	/** Por qué no está disponible (reservado, en uso…) */
	motivo: string | null;
	/** Alternativa libre parecida */
	sugerencia: string | null;
}
