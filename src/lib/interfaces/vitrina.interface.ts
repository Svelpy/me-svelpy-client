import type { Timestamps } from './common.interface';

/** Configuración de la vitrina (una por tarjeta) */
export interface Vitrina extends Timestamps {
	id: string;
	tarjeta_id: string;
	mostrar_precios: boolean;
	/** ISO 4217, por defecto BOB */
	moneda: string;
	/** Nombre de cada campo libre de los ítems (Dormitorios, Duración…); null = campo no usado */
	campo1_nombre: string | null;
	campo2_nombre: string | null;
	campo3_nombre: string | null;
	campo4_nombre: string | null;
}

export interface VitrinaCategoria extends Timestamps {
	id: string;
	vitrina_id: string;
	nombre: string;
	is_visible: boolean;
	orden: number;
}

export interface VitrinaItemImagen {
	id: string;
	item_id: string;
	url: string;
	alt: string | null;
	/** 0 = imagen principal */
	orden: number;
	created_at: string;
}

export interface VitrinaItem extends Timestamps {
	id: string;
	vitrina_id: string;
	/** De la misma vitrina; null = sin categoría */
	categoria_id: string | null;
	titulo: string;
	descripcion: string | null;
	/** null = "Consultar". Mayor o igual a 0 */
	precio: number | null;
	/** Precio tachado; mayor que `precio` */
	precio_anterior: number | null;
	/** Desde, por sesión… */
	precio_etiqueta: string | null;
	campo1: string | null;
	campo2: string | null;
	campo3: string | null;
	campo4: string | null;
	destacado: boolean;
	is_visible: boolean;
	orden: number;
	/** Ordenadas; la primera es la principal */
	imagenes: VitrinaItemImagen[];
}

/** `GET /tarjetas/{id}/vitrina` y parte de `TarjetaCompleta` */
export interface VitrinaCompleta extends Vitrina {
	categorias: VitrinaCategoria[];
	items: VitrinaItem[];
}

/** `PUT /tarjetas/{id}/vitrina` */
export interface VitrinaUpdateRequest {
	mostrar_precios?: boolean;
	moneda?: string;
	campo1_nombre?: string | null;
	campo2_nombre?: string | null;
	campo3_nombre?: string | null;
	campo4_nombre?: string | null;
}

/** `POST /vitrinas/{id}/categorias` */
export interface VitrinaCategoriaCreateRequest {
	nombre: string;
	is_visible?: boolean;
}

/** `PATCH /vitrina-categorias/{id}` */
export type VitrinaCategoriaUpdateRequest = Partial<VitrinaCategoriaCreateRequest>;

export interface VitrinaItemImagenInput {
	url: string;
	alt?: string | null;
}

/** `POST /vitrinas/{id}/items`, con sus imágenes en la misma petición */
export interface VitrinaItemCreateRequest {
	titulo: string;
	descripcion?: string | null;
	categoria_id?: string | null;
	precio?: number | null;
	precio_anterior?: number | null;
	precio_etiqueta?: string | null;
	campo1?: string | null;
	campo2?: string | null;
	campo3?: string | null;
	campo4?: string | null;
	destacado?: boolean;
	is_visible?: boolean;
	/** En orden: la primera es la principal */
	imagenes?: VitrinaItemImagenInput[];
}

/** `PATCH /vitrina-items/{id}`. Si trae `imagenes`, reemplazan a las anteriores en ese orden */
export type VitrinaItemUpdateRequest = Partial<VitrinaItemCreateRequest>;

/** `POST /vitrina-items/{id}/imagenes`: se agrega al final */
export type VitrinaItemImagenCreateRequest = VitrinaItemImagenInput;

/**
 * Vitrina dentro de una tarjeta nueva. Los ítems apuntan a una categoría de la misma petición
 * por su nombre (todavía no tiene id).
 */
export interface VitrinaNuevaRequest extends VitrinaUpdateRequest {
	categorias?: VitrinaCategoriaCreateRequest[];
	items?: (Omit<VitrinaItemCreateRequest, 'categoria_id'> & { categoria_nombre?: string | null })[];
}
