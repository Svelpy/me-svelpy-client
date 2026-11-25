import type { Timestamps } from './common.interface';

/** Configuración de la vitrina (una por tarjeta, con el mismo id) */
export interface VitrinaConfig {
	mostrar_precios: boolean;
	/** ISO 4217, por defecto BOB */
	moneda: string;
	/** Nombre de cada campo libre de los ítems (Dormitorios, Duración…); null = campo no usado */
	campo1_nombre: string | null;
	campo2_nombre: string | null;
	campo3_nombre: string | null;
	campo4_nombre: string | null;
}

/** `VitrinaCategoriaPublic` */
export interface VitrinaCategoriaPublica {
	id: string;
	nombre: string;
}

/** `VitrinaCategoriaResponse` */
export interface VitrinaCategoria extends VitrinaCategoriaPublica, Timestamps {
	vitrina_id: string;
	is_visible: boolean;
	orden: number;
}

/** `VitrinaItemImagenPublic` */
export interface VitrinaItemImagenPublica {
	id: string;
	url: string;
	alt: string | null;
	/** 0 = imagen principal */
	orden: number;
}

/** `VitrinaItemImagenResponse` */
export interface VitrinaItemImagen extends VitrinaItemImagenPublica, Timestamps {
	item_id: string;
}

/** `VitrinaItemPublic`. Si la vitrina oculta precios, llegan en null */
export interface VitrinaItemPublico {
	id: string;
	/** null = sin categoría */
	categoria_id: string | null;
	titulo: string;
	descripcion: string | null;
	/** Decimal como texto ("250.00"); null = "Consultar" */
	precio: string | null;
	/** Precio tachado; mayor que `precio` */
	precio_anterior: string | null;
	/** Desde, por sesión… */
	precio_etiqueta: string | null;
	campo1: string | null;
	campo2: string | null;
	campo3: string | null;
	campo4: string | null;
	destacado: boolean;
	/** Ordenadas; la primera es la principal. Máximo 3 */
	imagenes: VitrinaItemImagenPublica[];
}

/** `VitrinaItemResponseDetail` */
export interface VitrinaItem extends Omit<VitrinaItemPublico, 'imagenes'>, Timestamps {
	vitrina_id: string;
	is_visible: boolean;
	orden: number;
	categoria: VitrinaCategoria | null;
	imagenes: VitrinaItemImagen[];
}

/** `VitrinaPublic`: categorías visibles e ítems visibles (sin los de una categoría oculta) */
export interface VitrinaPublica extends VitrinaConfig {
	categorias: VitrinaCategoriaPublica[];
	items: VitrinaItemPublico[];
}

/** `VitrinaResponseDetail` */
export interface VitrinaCompleta extends VitrinaConfig, Timestamps {
	id: string;
	categorias: VitrinaCategoria[];
	items: VitrinaItem[];
}

/** `VitrinaCategoriaCreate` */
export interface VitrinaCategoriaInput {
	nombre: string;
	is_visible?: boolean;
	orden?: number;
}

/** `VitrinaCategoriaNestedItem` */
export interface VitrinaCategoriaNestedItem extends VitrinaCategoriaInput {
	id?: string | null;
}

/** `VitrinaItemImagenCreate`: la URL es la que devolvió `POST /imagenes/uploads` */
export interface VitrinaItemImagenInput {
	url: string;
	alt?: string | null;
	orden?: number;
}

/** `VitrinaItemImagenNestedItem` */
export interface VitrinaItemImagenNestedItem extends VitrinaItemImagenInput {
	id?: string | null;
}

/** `VitrinaItemCreateNested` */
export interface VitrinaItemInput {
	categoria_id?: string | null;
	titulo: string;
	descripcion?: string | null;
	precio?: number | string | null;
	precio_anterior?: number | string | null;
	precio_etiqueta?: string | null;
	campo1?: string | null;
	campo2?: string | null;
	campo3?: string | null;
	campo4?: string | null;
	destacado?: boolean;
	is_visible?: boolean;
	orden?: number;
	imagenes?: VitrinaItemImagenInput[];
}

/** `VitrinaItemNestedItem`: `imagenes` es el estado final; ausente o null no se toca */
export interface VitrinaItemNestedItem extends Omit<VitrinaItemInput, 'imagenes'> {
	id?: string | null;
	imagenes?: VitrinaItemImagenNestedItem[] | null;
}

/** `VitrinaCreateNested` (dentro de `POST /tarjetas/`): los ítems todavía no tienen categoría */
export interface VitrinaCreateRequest extends Partial<VitrinaConfig> {
	categorias?: VitrinaCategoriaInput[];
	items?: VitrinaItemInput[];
}

/**
 * `PATCH /vitrinas/{id}` (`VitrinaUpdateNested`). `categorias` e `items` son el estado final:
 * ausente o null no se toca, [] los elimina. Un ítem solo usa una categoría que ya existe y se
 * conserva; una categoría con ítems no se puede eliminar (409).
 */
export interface VitrinaUpdateRequest extends Partial<VitrinaConfig> {
	categorias?: VitrinaCategoriaNestedItem[] | null;
	items?: VitrinaItemNestedItem[] | null;
}
