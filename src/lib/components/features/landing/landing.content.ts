/**
 * Contenido de la landing de ME by Svelpy (fuente: dataLanding.md).
 * Todo el texto y los enlaces viven aquí para que las secciones solo se ocupen del diseño.
 * Pocas palabras por bloque: un titular, una frase y una acción.
 */
import { resolve } from '$app/paths';
import valeriaRojas from '#lib/assets/landing/perfiles/valeria-rojas.png?enhanced';
import camilaRivas from '#lib/assets/landing/perfiles/dra-camila-rivas.png?enhanced';
import andresQuiroga from '#lib/assets/landing/perfiles/andres-quiroga.png?enhanced';
import marianaOrtiz from '#lib/assets/landing/perfiles/mariana-ortiz.png?enhanced';

/** Imagen procesada por @sveltejs/enhanced-img (AVIF/WebP + tamaños). */
export type Picture = typeof valeriaRojas;

// ── Marca y enlaces

export const ME_DOMINIO = 'me.svelpy.com';

/**
 * WhatsApp de ventas (+591 76727537) en formato internacional: solo dígitos, sin "+" ni espacios.
 * Si se deja vacío, los botones de WhatsApp llevan a la sección de cierre.
 */
export const WHATSAPP_VENTAS = '59176727537';

function whatsapp(mensaje: string): string {
	if (!WHATSAPP_VENTAS) return '#contacto';
	return `https://wa.me/${WHATSAPP_VENTAS}?text=${encodeURIComponent(mensaje)}`;
}

export const LANDING_LINKS = {
	iniciarSesion: resolve('/auth/sign-in'),
	/** Registro propio; el campo de enlace de la landing le agrega `?enlace=` */
	registro: resolve('/auth/sign-up'),
	solicitarMe: whatsapp('Hola, quiero que me armen mi ME.'),
	consulta: whatsapp('Hola, tengo una consulta sobre ME.'),
	svelpy: 'https://svelpy.com'
} as const;

/**
 * Las dos formas de tener un ME, cada una con un solo nombre en toda la landing:
 * crearla uno mismo (registro gratis) o pedir que la arme el equipo (WhatsApp).
 */
export const CTA_CREAR = 'Crear mi ME gratis';
export const CTA_SOLICITAR = 'Solicitar mi ME por WhatsApp';

export const LOGOS = {
	isotipoOscuro: '/images/landing/me-isotipo-oscuro.svg',
	isotipoClaro: '/images/landing/me-isotipo-claro.svg',
	completoOscuro: '/images/landing/me-by-svelpy-oscuro.svg',
	completoClaro: '/images/landing/me-by-svelpy-claro.svg',
	svelpyBlanco: '/images/logo_svelpy/webp/Svelpy_Logo_Blanco_Transparente.webp'
} as const;

// ── Navegación

export interface LandingNavLink {
	label: string;
	href: `#${string}`;
}

export const NAV_LINKS: LandingNavLink[] = [
	{ label: 'Funciones', href: '#funciones' },
	{ label: 'Diseño', href: '#diseno' },
	{ label: 'SEO + GEO', href: '#seo-geo' },
	{ label: 'Cómo empezar', href: '#empezar' },
	{ label: 'Preguntas', href: '#preguntas' }
];

// ── Perfiles de ejemplo (simulados: reemplazar por capturas de clientes reales)

export interface PerfilEjemplo {
	slug: string;
	nombre: string;
	cargo: string;
	empresa: string;
	imagen: Picture;
	alt: string;
}

export const PERFILES = {
	valeria: {
		slug: 'valeria-rojas',
		nombre: 'Valeria Rojas',
		cargo: 'Agente inmobiliaria',
		empresa: 'Horizonte Propiedades',
		imagen: valeriaRojas,
		alt: 'Perfil ME de Valeria Rojas, agente inmobiliaria: botón Guardar contacto, accesos a llamada, WhatsApp, correo y ubicación, dos propiedades destacadas con precio y su oficina en el mapa.'
	},
	camila: {
		slug: 'dra-camila-rivas',
		nombre: 'Dra. Camila Rivas',
		cargo: 'Odontóloga',
		empresa: 'Clínica Sonríe',
		imagen: camilaRivas,
		alt: 'Perfil ME de la Dra. Camila Rivas, odontóloga: botón Guardar contacto, tratamientos con precio y consulta por WhatsApp, consultorio en el mapa y botón Agendar cita.'
	},
	andres: {
		slug: 'andres-quiroga',
		nombre: 'Andrés Quiroga',
		cargo: 'Gerente comercial',
		empresa: 'Andina Logística',
		imagen: andresQuiroga,
		alt: 'Perfil ME de Andrés Quiroga, gerente comercial de una empresa de logística: botón Guardar contacto, servicios para cotizar, centro logístico en el mapa y botón Solicitar cotización.'
	},
	mariana: {
		slug: 'mariana-ortiz',
		nombre: 'Mariana Ortiz',
		cargo: 'Abogada corporativa',
		empresa: 'Ortiz & Asociados',
		imagen: marianaOrtiz,
		alt: 'Perfil ME de Mariana Ortiz, abogada corporativa: diseño sobrio en verde, botón Guardar contacto, áreas de práctica, estudio jurídico en el mapa y botón Agendar reunión.'
	}
} satisfies Record<string, PerfilEjemplo>;

// ── Hero

export const HERO = {
	titulo: 'Tu tarjeta de presentación, ahora es una web.',
	subtitulo:
		'Contacto, servicios, sucursales y horarios en un solo enlace con QR. Que te guarden en un toque y te encuentren en Google y en la IA.',
	notaGratis: 'Crearla y diseñarla es gratis.',
	alternativa: '¿Prefieres que la armemos por ti?',
	perfiles: [PERFILES.valeria, PERFILES.camila, PERFILES.andres, PERFILES.mariana]
};

// ── Funciones (se muestran como la pila de botones de un perfil)

export type IconoFuncion =
	'contacto' | 'vitrina' | 'sucursales' | 'pago' | 'redes' | 'formacion' | 'preguntas' | 'qr';

export interface Funcion {
	icono: IconoFuncion;
	titulo: string;
	texto: string;
}

export const FUNCIONES = {
	titulo: 'Todo lo que tu cliente busca, en un solo enlace.',
	subtitulo:
		'Muestra solo las secciones que te sirven y cámbialas cuando quieras desde tu celular.',
	items: [
		{
			icono: 'contacto',
			titulo: 'Guardar contacto',
			texto: 'Tu foto, nombre y teléfono directo a su agenda.'
		},
		{
			icono: 'vitrina',
			titulo: 'Vitrina con precios',
			texto: 'Servicios, productos o propiedades con consulta por WhatsApp.'
		},
		{
			icono: 'sucursales',
			titulo: 'Sucursales y horarios',
			texto: 'Cada dirección con su mapa y sus horas de atención.'
		},
		{
			icono: 'pago',
			titulo: 'QR de pago',
			texto: 'El QR de tu banco para cobrar consultas o reservas.'
		},
		{
			icono: 'redes',
			titulo: 'Redes y agenda',
			texto: 'Instagram, LinkedIn, Calendly, Doctoralia y más de 20 redes.'
		},
		{
			icono: 'formacion',
			titulo: 'Formación y certificaciones',
			texto: 'Opcional, con enlace para verificar cada credencial.'
		},
		{
			icono: 'preguntas',
			titulo: 'Tus preguntas frecuentes',
			texto: 'Responde antes de que te pregunten.'
		},
		{
			icono: 'qr',
			titulo: 'Enlace corto y QR',
			texto: 'Para tu bio, tu firma de correo o tu tarjeta física.'
		}
	] satisfies Funcion[]
};

// ── Diseño

export const DISENO = {
	titulo: 'Con tus colores, no con los de una plantilla.',
	subtitulo: 'Parte de uno de los 10 temas y ajusta cada color y la tipografía a tu marca.',
	nota: 'Es solo el punto de partida: cada color se cambia por separado.'
};

// ── SEO + GEO

export const SEO_GEO = {
	titulo: 'Que te encuentren en Google y te recomiende la IA.',
	subtitulo:
		'Tu ME se publica con los datos que leen los buscadores y asistentes como ChatGPT o Gemini: tu rubro, tu zona y tus servicios.'
};

// ── Dos formas de empezar

export const EMPEZAR = {
	titulo: 'Dos formas de tener tu ME.',
	crear: {
		titulo: 'Créala tú',
		texto: 'Gratis para crear y diseñar. Publicas cuando estés listo.',
		pasos: [
			'Reserva tu enlace y crea tu cuenta.',
			'Completa tus datos y elige tu diseño.',
			'Publícala con el plan Pro y compártela.'
		]
	},
	solicitar: {
		titulo: 'Te la armamos',
		texto: 'Nos envías tus datos por WhatsApp y nuestro equipo la deja lista.',
		puntos: [
			'Diseño y carga de contenido incluidos.',
			'Lista para compartir en 24 horas.',
			'Después la editas tú cuando quieras.'
		]
	}
};

// ── Preguntas frecuentes

export interface PreguntaFrecuente {
	pregunta: string;
	respuesta: string;
}

export const FAQ: PreguntaFrecuente[] = [
	{
		pregunta: '¿Crear mi ME tiene costo?',
		respuesta:
			'Crearla, completarla y diseñarla es gratis. Para publicarla y compartir tu enlace activas el plan Pro.'
	},
	{
		pregunta: '¿Mis clientes necesitan instalar algo?',
		respuesta:
			'No. Tu ME se abre en el navegador de cualquier celular o computadora, con tu enlace o tu QR.'
	},
	{
		pregunta: '¿Puedo cambiar mis datos después?',
		respuesta:
			'Sí, cuando quieras y desde tu celular. Tu enlace y tu QR siguen siendo los mismos y muestran lo nuevo.'
	},
	{
		pregunta: '¿En qué se diferencia crearla yo de pedirla por WhatsApp?',
		respuesta:
			'Por WhatsApp nuestro equipo la arma por ti y te la entrega lista en 24 horas. En los dos casos, después la administras tú.'
	},
	{
		pregunta: '¿Sirve para mi profesión?',
		respuesta:
			'Sí. Indicas tu rubro y eliges qué secciones mostrar: funciona para cualquier profesional o negocio.'
	}
];

// ── Cierre

export const CIERRE = {
	titulo: 'Reserva tu enlace antes que otro.'
};

// ── Metadatos

export const LANDING_SEO = {
	titulo: 'ME | Tarjeta digital profesional',
	descripcion:
		'Crea gratis tu tarjeta digital profesional: que guarden tu contacto en un toque, muestra tus servicios y sucursales, y que Google y la IA te encuentren.',
	keywords: [
		'tarjeta digital',
		'tarjeta de presentación digital',
		'vcard',
		'código QR',
		'agentes inmobiliarios',
		'médicos',
		'odontólogos',
		'abogados',
		'SEO',
		'GEO',
		'profesionales independientes',
		'ME'
	],
	ogImagen: '/images/landing/og-me-by-svelpy.png',
	ogImagenAlt:
		'ME: perfiles digitales de una odontóloga y una agente inmobiliaria junto al titular «Tu tarjeta de presentación, ahora es una web» y el campo me.svelpy.com/tu-nombre para crear tu ME gratis.',
	locale: 'es_LA',
	themeColor: '#1c0f1e'
};
