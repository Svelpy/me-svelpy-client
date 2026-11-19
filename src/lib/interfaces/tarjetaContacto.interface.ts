import type { Timestamps } from './common.interface';

export type ContactoTipo = 'phone' | 'email' | 'website';

export interface TarjetaContacto extends Timestamps {
	id: string;
	tarjeta_id: string;
	tipo: ContactoTipo;
	/** Número, correo o URL */
	valor: string;
	/** Celular, Consultorio… */
	etiqueta: string | null;
	/** Solo en teléfonos: el número tiene WhatsApp */
	is_wpp: boolean;
	/** El principal de su tipo: va al .vcf, a los accesos rápidos y al botón flotante */
	is_primary: boolean;
	is_visible: boolean;
	orden: number;
}

/** `POST /tarjetas/{id}/contactos`. Se agrega al final de la lista */
export interface TarjetaContactoCreateRequest {
	tipo: ContactoTipo;
	valor: string;
	etiqueta?: string | null;
	is_wpp?: boolean;
	is_primary?: boolean;
	is_visible?: boolean;
}

/** `PATCH /contactos/{id}` */
export type TarjetaContactoUpdateRequest = Partial<TarjetaContactoCreateRequest>;
