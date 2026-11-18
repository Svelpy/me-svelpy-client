/**
 * Contenido de la landing de ME by Svelpy (fuente: dataLanding.md).
 * Todo el texto y los enlaces viven aquí para que las secciones solo se ocupen del diseño.
 */
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
	// TODO: usar resolve('/auth/sign-in') cuando exista la ruta.
	iniciarSesion: '/auth/sign-in',
	crearMe: whatsapp('Hola, quiero crear mi ME.'),
	perfilesEjemplo: '#sectores',
	svelpy: 'https://svelpy.com'
} as const;

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
	{ label: 'Cómo funciona', href: '#como-funciona' },
	{ label: 'Beneficios', href: '#beneficios' },
	{ label: 'Sectores', href: '#sectores' },
	{ label: 'SEO + GEO', href: '#seo-geo' },
	{ label: 'Contacto', href: '#contacto' }
];

// ── Perfiles de ejemplo (simulados: reemplazar por capturas de clientes reales)

export interface PerfilEjemplo {
	slug: string;
	nombre: string;
	cargo: string;
	empresa: string;
	/** Etiqueta corta para el selector del hero. */
	rubro: string;
	imagen: Picture;
	alt: string;
}

export const PERFILES = {
	valeria: {
		slug: 'valeria-rojas',
		nombre: 'Valeria Rojas',
		cargo: 'Agente inmobiliaria',
		empresa: 'Horizonte Propiedades',
		rubro: 'Inmobiliaria',
		imagen: valeriaRojas,
		alt: 'Perfil ME de Valeria Rojas, agente inmobiliaria: botón Guardar contacto, accesos a llamada, WhatsApp, correo y ubicación, dos propiedades destacadas con precio y su oficina en el mapa.'
	},
	camila: {
		slug: 'dra-camila-rivas',
		nombre: 'Dra. Camila Rivas',
		cargo: 'Odontóloga',
		empresa: 'Clínica Sonríe',
		rubro: 'Odontología',
		imagen: camilaRivas,
		alt: 'Perfil ME de la Dra. Camila Rivas, odontóloga: botón Guardar contacto, tratamientos con precio y consulta por WhatsApp, consultorio en el mapa y botón Agendar cita.'
	},
	andres: {
		slug: 'andres-quiroga',
		nombre: 'Andrés Quiroga',
		cargo: 'Gerente comercial',
		empresa: 'Andina Logística',
		rubro: 'Ejecutivo',
		imagen: andresQuiroga,
		alt: 'Perfil ME de Andrés Quiroga, gerente comercial de una empresa de logística: botón Guardar contacto, servicios para cotizar, centro logístico en el mapa y botón Solicitar cotización.'
	},
	mariana: {
		slug: 'mariana-ortiz',
		nombre: 'Mariana Ortiz',
		cargo: 'Abogada corporativa',
		empresa: 'Ortiz & Asociados',
		rubro: 'Abogacía',
		imagen: marianaOrtiz,
		alt: 'Perfil ME de Mariana Ortiz, abogada corporativa: diseño sobrio en verde, botón Guardar contacto, áreas de práctica, estudio jurídico en el mapa y botón Agendar reunión.'
	}
} satisfies Record<string, PerfilEjemplo>;

// ── Hero

export const HERO = {
	badge: 'Nueva generación de identidad digital · SEO + GEO ready',
	titulo: 'Que no solo guarden tu contacto: haz que te encuentren primero.',
	subtitulo:
		'Reemplaza las antiguas tarjetas de papel por tu propia vitrina digital autoadministrable. Comparte tu contacto en un toque, exhibe tu catálogo de propiedades o servicios, muestra tus sucursales y posiciona tu nombre en Google e Inteligencia Artificial.',
	ctaPrimario: 'Quiero mi ME',
	ctaSecundario: 'Ver perfiles de ejemplo en vivo',
	garantias: ['Listo en 24 horas', '100% autoadministrable', 'Sin instalar aplicaciones'],
	perfiles: [PERFILES.valeria, PERFILES.camila, PERFILES.andres]
};

// ── Problema vs. solución

export const PROBLEMA = {
	titulo: 'El 90% de las tarjetas de papel terminan en la basura antes de cerrar el negocio.',
	subtitulo:
		'Eres excelente en lo que haces, pero un trozo de cartón estático no demuestra tu nivel ni te ayuda a vender.',
	antes: {
		titulo: 'La tarjeta tradicional o el link básico',
		puntos: [
			'Si cambias de número, de oficina o de horarios, quedan obsoletas.',
			'Tu cliente tiene que teclear tu número manualmente (casi nadie lo hace).',
			'No muestra tus propiedades del mes, tus tratamientos ni tus casos de éxito.',
			'Es invisible en internet: solo sirve si tienes a la persona enfrente.'
		]
	},
	despues: {
		titulo: 'El estándar ME',
		puntos: [
			{
				titulo: 'Descarga directa en 1 clic',
				texto:
					'Tu foto, nombre, especialidad y teléfono se guardan directo en la agenda de tu cliente.'
			},
			{
				titulo: 'Vitrina viva 24/7',
				texto:
					'Sube y actualiza tus mejores viviendas, servicios o catálogo en 10 segundos desde tu celular.'
			},
			{
				titulo: 'Visibilidad total (SEO + GEO)',
				texto:
					'Optimizada para que nuevos clientes te encuentren buscando tu especialidad en Google o preguntándole a la IA.'
			}
		]
	}
};

// ── Funciones autoadministrables (bento)

export const FUNCIONES = {
	titulo: 'El poder de una página web. La agilidad de una tarjeta digital.',
	subtitulo:
		'No dependas de programadores ni diseñadores cada vez que quieras actualizar tu información. Desde tu propio panel administras todo en tiempo real y muestras solo las secciones que te sirven.',
	paleta: {
		titulo: 'Paleta de colores a medida',
		texto:
			'Empieza con un tema listo y luego ajusta cada color a tu marca: fondo, botones, precios, íconos y botón flotante.',
		nota: 'Este es solo el punto de partida: después puedes cambiar cada color por separado.'
	},
	catalogo: {
		titulo: 'Catálogo y destacados',
		texto:
			'Publica tus viviendas estrella, servicios o promociones con fotos, categorías, precio de oferta y botón de consulta directo a tu WhatsApp.'
	},
	sucursales: {
		titulo: 'Múltiples sucursales y mapas',
		texto:
			'¿Atiendes en dos consultorios o tienes varias oficinas? Muestra cada dirección con su propio pin de Google Maps.'
	},
	horarios: {
		titulo: 'Horarios inteligentes',
		texto:
			'Configura tus horarios por día y sucursal para que tus clientes sepan cuándo visitarte o llamarte.'
	},
	vcf: {
		titulo: 'Guardado en agenda',
		texto:
			'Un botón central para que tu contacto quede registrado con tu foto en el teléfono de tu cliente.'
	},
	qr: {
		titulo: 'Código QR y enlace corto',
		texto:
			'Un link limpio y un código QR con el isotipo ME, listo para tu celular, firma de correo o tarjeta física.'
	},
	qrPago: {
		titulo: 'QR de pago',
		texto:
			'Sube el QR de cobro de tu banco y recibe pagos de consultas, reservas o anticipos desde tu propio perfil.'
	},
	credenciales: {
		titulo: 'Formación y certificaciones',
		texto:
			'Si quieres, agrega tus estudios y certificaciones con su código y enlace de verificación. Es opcional: actívalo solo si suma a tu perfil.'
	},
	redes: {
		titulo: 'Redes y agenda en línea',
		texto:
			'Enlaza Instagram, TikTok, LinkedIn y más de 20 redes, incluidas Calendly y Doctoralia para que te agenden en dos toques.'
	},
	faq: {
		titulo: 'Tus propias preguntas frecuentes',
		texto:
			'Responde por adelantado lo que más te consultan: formas de pago, zonas de atención o cómo prepararse para una cita.'
	}
};

// ── SEO + GEO

export const SEO_GEO = {
	badge: 'Tecnología exclusiva de posicionamiento',
	titulo: 'Diseñada para que Google y la Inteligencia Artificial te recomienden.',
	cuerpo:
		'Una tarjeta común solo funciona cuando tú la entregas en mano. ME estructura técnicamente tu perfil profesional con metadatos avanzados y esquemas semánticos para que trabajes mientras duermes.',
	seo: {
		titulo: 'Optimización SEO (Google)',
		texto:
			'Cuando alguien busque tu nombre o tu especialidad en tu ciudad, tu perfil oficial aparecerá indexado con tus servicios y contacto directo.'
	},
	geo: {
		titulo: 'Optimización GEO (ChatGPT, Gemini, Perplexity)',
		texto:
			'Indicas tu rubro y estructuramos tu especialidad, zona de cobertura, sucursales y catálogo en el lenguaje exacto que leen las inteligencias artificiales para recomendarte cuando un usuario pregunte por el mejor profesional de tu sector.'
	}
};

// ── Sectores

export interface Sector {
	id: string;
	tab: string;
	para?: string;
	titular: string;
	descripcion: string;
	destaca: string[];
	perfil: PerfilEjemplo;
}

export const SECTORES = {
	titulo: 'Una solución adaptada a tu profesión.',
	items: [
		{
			id: 'inmobiliarios',
			tab: 'Agentes inmobiliarios',
			para: 'Para agentes de RE/MAX, Century 21 y brokers independientes.',
			titular: 'Que tu comprador recuerde tu cara y tus propiedades, no un papel.',
			descripcion:
				'Destaca tus captaciones más rentables del mes, actualiza precios al instante, permite que agenden visitas por WhatsApp y haz que tu contacto quede guardado con tu foto en el celular de cada inversionista.',
			destaca: [
				'Botón «Guardar contacto» con tu foto',
				'Carrusel de viviendas estrella del mes',
				'WhatsApp directo por propiedad'
			],
			perfil: PERFILES.valeria
		},
		{
			id: 'salud',
			tab: 'Médicos y odontólogos',
			para: 'Para médicos, odontólogos y medicina estética.',
			titular: 'Llena tu agenda de consultas y facilita que tus pacientes te recomienden.',
			descripcion:
				'Cuando un paciente te recomiende a un familiar, compartirá tu perfil completo con tus credenciales, ubicación exacta de tus consultorios en el mapa, horarios actualizados y botón de reserva de turno en dos toques.',
			destaca: [
				'Especialidades y tratamientos con precio',
				'Varios consultorios en Google Maps',
				'Horarios y reserva por WhatsApp, Calendly o Doctoralia'
			],
			perfil: PERFILES.camila
		},
		{
			id: 'profesionales',
			tab: 'Abogados y consultores',
			para: 'Para abogados, ingenieros y consultores.',
			titular: 'Autoridad y prestigio corporativo desde el primer saludo.',
			descripcion:
				'Presenta tus especialidades, certificaciones, portafolio de proyectos u obras ejecutadas y ubicación de tu estudio con una estética sobria y ejecutiva.',
			destaca: [
				'Diseño sobrio y ejecutivo',
				'Áreas de práctica o dossier de obras',
				'Formación y certificaciones con enlace de verificación'
			],
			perfil: PERFILES.mariana
		},
		{
			id: 'otros',
			tab: 'Cualquier profesión',
			para: 'Para ejecutivos, arquitectos, contadores, fotógrafos, coaches y cualquier profesional o negocio.',
			titular: 'Sea cual sea tu rubro, tu ME se adapta a lo que haces.',
			descripcion:
				'Indicas tu rubro, eliges qué secciones mostrar y cargas tus servicios o productos. Tu perfil queda listo para compartir en un toque y para que Google y la IA te encuentren.',
			destaca: [
				'Tu rubro, para que Google y la IA sepan a qué te dedicas',
				'Solo las secciones que necesitas',
				'Vitrina con tus servicios o productos'
			],
			perfil: PERFILES.andres
		}
	] satisfies Sector[]
};

// ── Cómo funciona

export const PASOS = {
	titulo: 'Tu vitrina digital activa en 3 simples pasos.',
	items: [
		{
			titulo: 'Elige tu enlace y configura tu estilo',
			texto: `Asegura tu URL personalizada (${ME_DOMINIO}/tu-nombre) elige un tema y ajusta los colores de tu marca.`
		},
		{
			titulo: 'Carga tu catálogo y ubicaciones',
			texto:
				'Agrega tus datos de contacto, redes, sucursales y tus propiedades o servicios destacados desde tu celular o PC.'
		},
		{
			titulo: 'Comparte, posiciona y vende',
			texto:
				'Muestra tu QR en reuniones, pon tu enlace en tu biografía de Instagram o TikTok y deja que nuestro motor SEO + GEO atraiga nuevos clientes.'
		}
	]
};

// ── Preguntas frecuentes

export interface PreguntaFrecuente {
	pregunta: string;
	respuesta: string;
}

export const FAQ: PreguntaFrecuente[] = [
	{
		pregunta: '¿Mis clientes necesitan descargar alguna aplicación para ver mi tarjeta?',
		respuesta:
			'No. Tu perfil ME se abre al instante en cualquier celular (iPhone o Android) o computadora directamente desde el navegador al escanear tu QR o tocar tu enlace.'
	},
	{
		pregunta: '¿Puedo cambiar mis fotos, propiedades, precios o colores yo mismo?',
		respuesta:
			'Sí, el 100%. Cuentas con un panel autoadministrable desde donde puedes editar tus colores, subir o bajar viviendas o servicios, cambiar horarios o añadir sucursales cuantas veces quieras y en tiempo real.'
	},
	{
		pregunta: '¿Qué pasa si cambio de número de teléfono o me mudo de oficina o consultorio?',
		respuesta:
			'Solo entras a tu panel, actualizas el dato en 5 segundos y tu mismo enlace y tu mismo código QR mostrarán la información nueva, sin gastar un centavo en reimpresiones.'
	},
	{
		pregunta: '¿Mis clientes pueden pagarme o agendar desde mi perfil?',
		respuesta:
			'Sí. Puedes mostrar el QR de cobro de tu banco para recibir pagos y enlazar tu WhatsApp, Calendly o Doctoralia para que te agenden en dos toques.'
	},
	{
		pregunta: '¿Puedo mostrar mis estudios y certificaciones?',
		respuesta:
			'Sí, si lo deseas. Son secciones opcionales: agrega tu formación y tus certificaciones con la entidad emisora, el código y el enlace de verificación de cada credencial, o déjalas ocultas.'
	},
	{
		pregunta: '¿ME sirve si mi profesión no aparece en la página?',
		respuesta:
			'Sí. ME funciona para cualquier profesional o negocio: indicas tu rubro, eliges qué secciones mostrar y tu perfil se adapta a lo que haces.'
	}
];

// ── Cierre

export const CIERRE = {
	titulo: 'Tu próxima gran venta empieza en el primer contacto. Haz que sea inolvidable.',
	subtitulo:
		'Únete a médicos, agentes inmobiliarios, abogados y profesionales de todos los rubros que ya evolucionaron su marca personal con ME.',
	ctaPrimario: 'Solicitar mi ME por WhatsApp',
	ctaSecundario: 'Ver perfiles de ejemplo'
};

// ── Metadatos

export const LANDING_SEO = {
	titulo: 'ME | Tarjeta digital profesional con SEO y GEO',
	descripcion:
		'Tu mini-web profesional autoadministrable: guarda tu contacto en un toque (.vcf), muestra tu catálogo y sucursales, y aparece en Google y en la IA.',
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
		'ME: perfiles digitales de una odontóloga y una agente inmobiliaria junto al titular «Que no solo guarden tu contacto: haz que te encuentren primero».',
	locale: 'es_LA',
	themeColor: '#1c0f1e'
};
