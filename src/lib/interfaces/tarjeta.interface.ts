import type { Timestamps } from './common.interface';
import type { PaginationParams } from './pagination.interface';
import type {
	TarjetaCertificacion,
	TarjetaCertificacionInput,
	TarjetaCertificacionNestedItem,
	TarjetaCertificacionPublica
} from './tarjetaCertificacion.interface';
import type {
	TarjetaContacto,
	TarjetaContactoInput,
	TarjetaContactoNestedItem,
	TarjetaContactoPublico
} from './tarjetaContacto.interface';
import type {
	TarjetaEducacion,
	TarjetaEducacionInput,
	TarjetaEducacionNestedItem,
	TarjetaEducacionPublica
} from './tarjetaEducacion.interface';
import type {
	TarjetaFaq,
	TarjetaFaqInput,
	TarjetaFaqNestedItem,
	TarjetaFaqPublica
} from './tarjetaFaq.interface';
import type {
	TarjetaSeccion,
	TarjetaSeccionNestedItem,
	TarjetaSeccionPublica
} from './tarjetaSeccion.interface';
import type {
	TarjetaSeo,
	TarjetaSeoPublico,
	TarjetaSeoUpdateRequest
} from './tarjetaSeo.interface';
import type {
	TarjetaSocial,
	TarjetaSocialInput,
	TarjetaSocialNestedItem,
	TarjetaSocialPublica
} from './tarjetaSocial.interface';
import type {
	TarjetaTheme,
	TarjetaThemeCreateRequest,
	TarjetaThemePublico
} from './tarjetaTheme.interface';
import type {
	TarjetaUbicacion,
	TarjetaUbicacionInput,
	TarjetaUbicacionNestedItem,
	TarjetaUbicacionPublica
} from './tarjetaUbicacion.interface';
import type { Usuario, UsuarioRef } from './usuario.interface';
import type { VitrinaCompleta, VitrinaCreateRequest, VitrinaPublica } from './vitrina.interface';

/**
 * Enum `PosicionNombreEmpresa`: dónde se muestra la empresa (logo + nombre) en la cabecera.
 * arriba = franja superior de la portada; abajo = bajo el cargo;
 * izquierda / derecha = insignia junto a la foto (el nombre va bajo el cargo); oculto = no se muestra.
 */
export type NombreEmpresaPosicion = 'arriba' | 'abajo' | 'izquierda' | 'derecha' | 'oculto';

/** Campos propios de la tarjeta que se editan con `PATCH /tarjetas/{id}` */
export interface TarjetaDatos {
	/** Dirección pública: me.svelpy.com/{slug}. 3 a 80: minúsculas, dígitos y guiones simples */
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
	qr_pago_url: string | null;
}

/** Columnas de `tarjeta` que llegan en todas las respuestas del panel */
export interface Tarjeta extends TarjetaDatos, Timestamps {
	id: string;
	user_id: string;
	is_public: boolean;
	published_at: string | null;
}

/** Item de `GET /tarjetas/` (`TarjetaResponseItemList`) */
export interface TarjetaListItem extends Tarjeta {
	user: UsuarioRef;
}

/**
 * `TarjetaResponseDetail`: respuesta de `POST /tarjetas/`, `PATCH /tarjetas/{id}`, publicar y
 * despublicar. Trae todas las listas (visibles y ocultas), sin theme, SEO ni vitrina.
 */
export interface TarjetaDetalle extends Tarjeta {
	user: Usuario;
	secciones: TarjetaSeccion[];
	contactos: TarjetaContacto[];
	ubicaciones: TarjetaUbicacion[];
	redes: TarjetaSocial[];
	educaciones: TarjetaEducacion[];
	certificaciones: TarjetaCertificacion[];
	faqs: TarjetaFaq[];
}

/**
 * La tarjeta con todo su contenido tal como la ve su dueño (`TarjetaResponseMe`): `tarjeta` de
 * `GET /usuarios/me` y `GET /tarjetas/{id}/completa`. Theme, SEO y vitrina comparten el id de la
 * tarjeta y cada uno se edita con su propio PATCH.
 */
export interface TarjetaCompleta extends Tarjeta {
	theme: TarjetaTheme;
	seo: TarjetaSeo;
	secciones: TarjetaSeccion[];
	contactos: TarjetaContacto[];
	ubicaciones: TarjetaUbicacion[];
	redes: TarjetaSocial[];
	educaciones: TarjetaEducacion[];
	certificaciones: TarjetaCertificacion[];
	faqs: TarjetaFaq[];
	vitrina: VitrinaCompleta;
}

/**
 * `GET /tarjetas/public/{slug}` (`TarjetaPublic`): lo que ve un visitante. Solo lo visible, ya
 * ordenado, sin auditoría ni datos de la cuenta. El editor arma la misma forma con `aPublica()`.
 */
export interface TarjetaPublica extends TarjetaDatos {
	id: string;
	theme: TarjetaThemePublico;
	seo: TarjetaSeoPublico;
	secciones: TarjetaSeccionPublica[];
	contactos: TarjetaContactoPublico[];
	ubicaciones: TarjetaUbicacionPublica[];
	redes: TarjetaSocialPublica[];
	educaciones: TarjetaEducacionPublica[];
	certificaciones: TarjetaCertificacionPublica[];
	faqs: TarjetaFaqPublica[];
	vitrina: VitrinaPublica;
}

/** Datos mínimos de una tarjeta: los guarda la sesión para el menú del panel */
export type TarjetaResumen = Pick<
	Tarjeta,
	| 'id'
	| 'slug'
	| 'prefijo'
	| 'nombres'
	| 'apellidos'
	| 'cargo'
	| 'rubro'
	| 'profile_url'
	| 'is_public'
	| 'published_at'
	| 'updated_at'
>;

/**
 * `POST /tarjetas/` (`TarjetaCreateNested`): una por usuario, con su árbol en una transacción. Nace
 * despublicada; sin theme, SEO o vitrina se crean con sus valores por defecto y las 8 secciones las
 * crea el backend. `user_id` (solo admin) crea la tarjeta de otra cuenta.
 */
export interface TarjetaCreateRequest {
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
	nombre_empresa_posicion?: NombreEmpresaPosicion;
	cover_url?: string | null;
	qr_pago_url?: string | null;
	theme?: TarjetaThemeCreateRequest | null;
	seo?: TarjetaSeoUpdateRequest | null;
	vitrina?: VitrinaCreateRequest | null;
	/** Máximo 10 */
	contactos?: TarjetaContactoInput[];
	/** Máximo 10 */
	ubicaciones?: TarjetaUbicacionInput[];
	/** Máximo 24 */
	redes?: TarjetaSocialInput[];
	/** Máximo 10 */
	educaciones?: TarjetaEducacionInput[];
	/** Máximo 10 */
	certificaciones?: TarjetaCertificacionInput[];
	/** Máximo 30 */
	faqs?: TarjetaFaqInput[];
	user_id?: string;
}

/**
 * `PATCH /tarjetas/{id}` (`TarjetaUpdateNested`). Un campo que no se envía no cambia. Cada lista es
 * el estado final: ausente o null no se toca, [] elimina todo; un elemento sin id se crea, con id se
 * actualiza y uno existente que no viene se elimina. `secciones` lleva siempre las 8.
 */
export interface TarjetaUpdateRequest extends Partial<
	Omit<TarjetaDatos, 'nombres' | 'slug' | 'rubro'>
> {
	slug?: string;
	rubro?: string;
	nombres?: string;
	secciones?: TarjetaSeccionNestedItem[] | null;
	contactos?: TarjetaContactoNestedItem[] | null;
	ubicaciones?: TarjetaUbicacionNestedItem[] | null;
	redes?: TarjetaSocialNestedItem[] | null;
	educaciones?: TarjetaEducacionNestedItem[] | null;
	certificaciones?: TarjetaCertificacionNestedItem[] | null;
	faqs?: TarjetaFaqNestedItem[] | null;
}

/** Filtros de `GET /tarjetas/` (un user solo ve la suya) */
export interface TarjetaFiltros extends PaginationParams {
	user_id?: string;
	is_public?: boolean;
}

/** `GET /tarjetas/public/slug-disponible/{slug}`. Con sesión, el slug propio cuenta como disponible */
export interface SlugDisponibilidad {
	slug: string;
	disponible: boolean;
}

/** `POST /tarjetas/despublicar-vencidas` */
export interface TarjetasDespublicadasResponse {
	despublicadas: number;
}
