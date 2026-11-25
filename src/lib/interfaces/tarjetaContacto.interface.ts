import type { Timestamps } from './common.interface';

export type ContactoTipo = 'phone' | 'email' | 'website';

/** Contacto visible de una tarjeta publicada (`TarjetaContactoPublic`) */
export interface TarjetaContactoPublico {
	id: string;
	tipo: ContactoTipo;
	/** Número, correo o URL */
	valor: string;
	/** Celular, Consultorio… */
	etiqueta: string | null;
	/** Solo en teléfonos: el número tiene WhatsApp */
	is_wpp: boolean;
	/** El principal de su tipo: va al .vcf y al botón flotante */
	is_primary: boolean;
}

/** `TarjetaContactoResponse` */
export interface TarjetaContacto extends TarjetaContactoPublico, Timestamps {
	tarjeta_id: string;
	is_visible: boolean;
	orden: number;
}

/** `TarjetaContactoCreate` (dentro de `POST /tarjetas/`) */
export interface TarjetaContactoInput {
	tipo: ContactoTipo;
	valor: string;
	etiqueta?: string | null;
	is_wpp?: boolean;
	is_primary?: boolean;
	is_visible?: boolean;
	orden?: number;
}

/** `TarjetaContactoNestedItem` (lista de `PATCH /tarjetas/{id}`): sin id se crea, con id se actualiza */
export interface TarjetaContactoNestedItem extends TarjetaContactoInput {
	id?: string | null;
}
