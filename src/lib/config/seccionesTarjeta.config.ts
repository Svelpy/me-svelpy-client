import type { Component } from 'svelte';
import {
	BoltIcon,
	BuildindStoreIcon,
	CertificateIcon,
	HelpCircleIcon,
	MapPinIcon,
	PhoneIcon,
	SchoolIcon,
	ShareIcon,
	UserIcon
} from '#lib/icons/outline/index.ts';
import type { SeccionClave } from '#lib/interfaces/index.ts';
import { Module } from './permissions.config';

export interface SeccionTarjetaConfig {
	/** Título en la tarjeta pública cuando `tarjeta_seccion.titulo` es null */
	titulo: string;
	/** Nombre en el editor del panel */
	etiqueta: string;
	/** Qué contiene, en una frase, para el editor */
	descripcion: string;
	icono: Component<{ class?: string }>;
	/** Módulo de permisos de su contenido */
	module: Module;
}

/** Las 9 secciones de una tarjeta (`tarjeta_seccion.clave`) */
export const SECCIONES_TARJETA: Record<SeccionClave, SeccionTarjetaConfig> = {
	acciones: {
		titulo: 'Accesos rápidos',
		etiqueta: 'Accesos rápidos',
		descripcion: 'Botones para llamar, escribir, ubicarte, compartir y pagar.',
		icono: BoltIcon,
		module: Module.TARJETA
	},
	acerca: {
		titulo: 'Acerca de mí',
		etiqueta: 'Acerca de mí',
		descripcion: 'Quién eres y cómo trabajas, en pocas líneas.',
		icono: UserIcon,
		module: Module.TARJETA
	},
	vitrina: {
		titulo: 'Servicios',
		etiqueta: 'Vitrina',
		descripcion: 'Servicios o productos con fotos, precios y consulta por WhatsApp.',
		icono: BuildindStoreIcon,
		module: Module.VITRINA
	},
	ubicacion: {
		titulo: 'Ubicación y horarios',
		etiqueta: 'Ubicaciones',
		descripcion: 'Dónde atiendes y en qué horarios.',
		icono: MapPinIcon,
		module: Module.UBICACION
	},
	contacto: {
		titulo: 'Contacto',
		etiqueta: 'Contacto',
		descripcion: 'Teléfonos, correos y sitios web.',
		icono: PhoneIcon,
		module: Module.CONTACTO
	},
	redes: {
		titulo: 'Redes',
		etiqueta: 'Redes',
		descripcion: 'Tus perfiles y los enlaces para agendar citas.',
		icono: ShareIcon,
		module: Module.RED_SOCIAL
	},
	educacion: {
		titulo: 'Formación',
		etiqueta: 'Formación',
		descripcion: 'Dónde estudiaste y qué títulos tienes.',
		icono: SchoolIcon,
		module: Module.EDUCACION
	},
	certificaciones: {
		titulo: 'Certificaciones',
		etiqueta: 'Certificaciones',
		descripcion: 'Credenciales con su código y enlace de verificación.',
		icono: CertificateIcon,
		module: Module.CERTIFICACION
	},
	faq: {
		titulo: 'Preguntas frecuentes',
		etiqueta: 'Preguntas frecuentes',
		descripcion: 'Respuestas a lo que más te consultan.',
		icono: HelpCircleIcon,
		module: Module.FAQ
	}
};

/** Orden de las secciones en una tarjeta nueva (como los perfiles de ejemplo de la landing) */
export const SECCIONES_ORDEN_POR_DEFECTO: SeccionClave[] = [
	'acciones',
	'acerca',
	'vitrina',
	'ubicacion',
	'contacto',
	'redes',
	'educacion',
	'certificaciones',
	'faq'
];
