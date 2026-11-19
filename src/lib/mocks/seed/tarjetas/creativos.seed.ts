import type { TarjetaNuevaRequest } from '#lib/interfaces/index.ts';
import {
	IMAGENES as I,
	LUNES_A_VIERNES,
	foto,
	logo,
	portada,
	qrPago,
	retrato,
	semana
} from '../recursos';

/** Tarjetas de prueba: gastronomía, fotografía, arquitectura, deporte y belleza */

export const tarjetaRodrigo: TarjetaNuevaRequest = {
	slug: 'chef-rodrigo-paz',
	rubro: 'Restaurante',
	nombres: 'Rodrigo',
	apellidos: 'Paz',
	cargo: 'Chef y propietario',
	nombre_empresa: 'Sabores de Mi Tierra',
	acerca_de_mi:
		'Cocina cruceña de siempre con productos del día: majadito, pique y parrillada a la leña. Reservamos mesas para grupos y preparamos eventos.',
	profile_url: retrato(I.retratos.rodrigo),
	cover_url: portada(I.comida.restaurante),
	logo_empresa_url: logo('Sabores Tierra', 'B42318'),
	nombre_empresa_posicion: 'arriba',
	qr_pago_url: qrPago('chef-rodrigo-paz'),
	is_public: true,
	theme: { preset: 'calido', tipografia: 8 },
	contactos: [
		{ tipo: 'phone', valor: '+591 75011223', etiqueta: 'Reservas', is_wpp: true, is_primary: true },
		{ tipo: 'email', valor: 'reservas@saboresdemitierra.test', is_primary: true }
	],
	ubicaciones: [
		{
			nombre: 'Restaurante',
			direccion: 'Av. Monseñor Rivero 345',
			ciudad: 'Santa Cruz de la Sierra',
			departamento: 'Santa Cruz',
			pais: 'Bolivia',
			lat: -17.775612,
			lng: -63.187214,
			horarios: semana([2, 3, 4, 5, 6, 7], ['12:00', '15:30'], ['19:00', '23:00'])
		}
	],
	sociales: [
		{
			red: 'instagram',
			url: 'https://instagram.com/saboresdemitierra.demo',
			username: 'saboresdemitierra.demo'
		},
		{ red: 'facebook', url: 'https://facebook.com/saboresdemitierra.demo' },
		{
			red: 'tiktok',
			url: 'https://tiktok.com/@chefrodrigopaz.demo',
			username: 'chefrodrigopaz.demo'
		}
	],
	vitrina: {
		mostrar_precios: true,
		moneda: 'BOB',
		campo1_nombre: 'Porción',
		categorias: [
			{ nombre: 'Para compartir' },
			{ nombre: 'Platos de fondo' },
			{ nombre: 'Postres' }
		],
		items: [
			{
				titulo: 'Parrillada a la leña',
				descripcion: 'Costilla, chorizo, lomo y achuras con yuca, arroz y llajua.',
				categoria_nombre: 'Para compartir',
				precio: 150,
				precio_anterior: 175,
				campo1: 'Para 2 o 3',
				destacado: true,
				imagenes: [{ url: foto(I.comida.costillas), alt: 'Costillas a la parrilla' }]
			},
			{
				titulo: 'Pique macho',
				descripcion: 'Carne picada, salchicha, papas fritas, locoto y huevo.',
				categoria_nombre: 'Para compartir',
				precio: 120,
				campo1: 'Para 2',
				imagenes: [{ url: foto(I.comida.carneConPapas), alt: 'Carne con papas fritas' }]
			},
			{
				titulo: 'Sopa de maní',
				descripcion: 'Con fideo, papa frita y perejil fresco.',
				categoria_nombre: 'Platos de fondo',
				precio: 35,
				campo1: 'Individual',
				imagenes: [{ url: foto(I.comida.sopa), alt: 'Plato de sopa' }]
			},
			{
				titulo: 'Ensalada de quinua',
				descripcion: 'Quinua real, palta, tomate cherry y queso fresco.',
				categoria_nombre: 'Platos de fondo',
				precio: 48,
				campo1: 'Individual',
				imagenes: [{ url: foto(I.comida.ensalada), alt: 'Ensalada en un bol' }]
			},
			{
				titulo: 'Cupcakes de achachairú',
				descripcion: 'Tres unidades con crema de la fruta de temporada.',
				categoria_nombre: 'Postres',
				precio: 30,
				campo1: '3 unidades',
				imagenes: [{ url: foto(I.comida.cupcakes), alt: 'Cupcakes con crema' }]
			}
		]
	},
	faq: [
		{
			pregunta: '¿Hacen envíos a domicilio?',
			respuesta:
				'Sí, dentro del cuarto anillo. Pide por WhatsApp hasta 30 minutos antes del cierre.'
		},
		{
			pregunta: '¿Puedo reservar para un cumpleaños?',
			respuesta: 'Claro. Para grupos de más de 10 personas armamos un menú cerrado con anticipo.'
		}
	]
};

export const tarjetaLucia: TarjetaNuevaRequest = {
	slug: 'lucia-fernandez-foto',
	rubro: 'Fotografía de bodas',
	nombres: 'Lucía',
	apellidos: 'Fernández',
	cargo: 'Fotógrafa de bodas y retratos',
	nombre_empresa: 'Lucía Fernández Estudio',
	acerca_de_mi:
		'Fotografío bodas como un documental: sin poses forzadas, atenta a lo que pasa entre la gente. Viajo a todo el país y entrego galerías en línea en tres semanas.',
	profile_url: retrato(I.retratos.lucia),
	cover_url: portada(I.fotografia.pareja),
	nombre_empresa_posicion: 'oculto',
	is_public: true,
	theme: { preset: 'oscuro', tipografia: 2 },
	contactos: [
		{ tipo: 'phone', valor: '+591 72233445', etiqueta: 'WhatsApp', is_wpp: true, is_primary: true },
		{ tipo: 'email', valor: 'hola@luciafernandez.test', is_primary: true },
		{ tipo: 'website', valor: 'www.luciafernandez.test', etiqueta: 'Portafolio' }
	],
	ubicaciones: [
		{
			nombre: 'Estudio',
			direccion: 'Av. América 1520, entre Pando y Libertador',
			ciudad: 'Cochabamba',
			departamento: 'Cochabamba',
			pais: 'Bolivia',
			lat: -17.375612,
			lng: -66.156631,
			horarios: semana([2, 3, 4, 5], ['10:00', '18:00'])
		}
	],
	sociales: [
		{
			red: 'instagram',
			url: 'https://instagram.com/luciafernandez.foto.demo',
			username: 'luciafernandez.foto.demo'
		},
		{ red: 'pinterest', url: 'https://pinterest.com/luciafernandezdemo' },
		{ red: 'vimeo', url: 'https://vimeo.com/luciafernandezdemo' }
	],
	vitrina: {
		mostrar_precios: true,
		moneda: 'BOB',
		campo1_nombre: 'Cobertura',
		campo2_nombre: 'Fotos editadas',
		items: [
			{
				titulo: 'Boda completa',
				descripcion: 'Preparativos, ceremonia y fiesta, con galería en línea y álbum impreso.',
				precio: 6500,
				campo1: '10 horas',
				campo2: '600 o más',
				destacado: true,
				imagenes: [
					{ url: foto(I.fotografia.pareja), alt: 'Pareja de novios caminando' },
					{ url: foto(I.fotografia.anillos), alt: 'Anillos de boda' }
				]
			},
			{
				titulo: 'Sesión preboda',
				descripcion: 'En exteriores, con cambio de vestuario y locación a elección.',
				precio: 1800,
				campo1: '3 horas',
				campo2: '80',
				imagenes: [{ url: foto(I.fotografia.parejaJardin), alt: 'Pareja en un jardín' }]
			},
			{
				titulo: 'Cobertura de eventos',
				descripcion: 'Quince años, bautizos y aniversarios.',
				precio: 1200,
				precio_etiqueta: 'Desde',
				campo1: '4 horas',
				campo2: '200',
				imagenes: [{ url: foto(I.fotografia.ramo), alt: 'Ramo de flores' }]
			},
			{
				titulo: 'Retrato profesional',
				descripcion: 'Para perfiles, prensa o tu propia tarjeta ME.',
				precio: 600,
				campo1: '1 hora',
				campo2: '15',
				imagenes: [{ url: foto(I.fotografia.camara), alt: 'Cámara fotográfica y lentes' }]
			}
		]
	},
	faq: [
		{
			pregunta: '¿Viajas a otras ciudades?',
			respuesta:
				'Sí. Los pasajes y el hospedaje se suman al paquete y te los detallo en la cotización.'
		},
		{
			pregunta: '¿Cuándo recibimos las fotos?',
			respuesta: 'Un adelanto de 30 fotos en una semana y la galería completa en tres.'
		}
	]
};

export const tarjetaMartin: TarjetaNuevaRequest = {
	slug: 'martin-rocha-arquitecto',
	rubro: 'Arquitectura',
	prefijo: 'Arq.',
	nombres: 'Martín',
	apellidos: 'Rocha',
	cargo: 'Arquitecto',
	nombre_empresa: 'Rocha Estudio de Arquitectura',
	acerca_de_mi:
		'Diseño casas y edificios que aprovechan la luz y la ventilación natural del oriente. Acompaño la obra hasta la entrega de llaves.',
	profile_url: retrato(I.retratos.martin),
	cover_url: portada(I.arquitectura.edificio),
	logo_empresa_url: logo('Rocha Estudio', '5B21B6'),
	nombre_empresa_posicion: 'derecha',
	is_public: true,
	theme: { preset: 'creativo', tipografia: 6 },
	contactos: [
		{ tipo: 'phone', valor: '+591 70955667', etiqueta: 'Estudio', is_wpp: true, is_primary: true },
		{ tipo: 'email', valor: 'martin@rochaestudio.test', is_primary: true },
		{ tipo: 'website', valor: 'www.rochaestudio.test', etiqueta: 'Portafolio' }
	],
	ubicaciones: [
		{
			nombre: 'Estudio',
			direccion: 'Calle Los Claveles 18, barrio Sirari',
			ciudad: 'Santa Cruz de la Sierra',
			departamento: 'Santa Cruz',
			pais: 'Bolivia',
			lat: -17.76852,
			lng: -63.19851,
			horarios: semana(LUNES_A_VIERNES, ['09:00', '13:00'], ['15:00', '19:00'])
		}
	],
	sociales: [
		{
			red: 'instagram',
			url: 'https://instagram.com/rochaestudio.demo',
			username: 'rochaestudio.demo'
		},
		{ red: 'behance', url: 'https://behance.net/rochaestudiodemo' },
		{ red: 'pinterest', url: 'https://pinterest.com/rochaestudiodemo' },
		{ red: 'linkedin', url: 'https://linkedin.com/in/martin-rocha-demo' }
	],
	vitrina: {
		mostrar_precios: false,
		campo1_nombre: 'Superficie',
		campo2_nombre: 'Ubicación',
		campo3_nombre: 'Año',
		categorias: [{ nombre: 'Viviendas' }, { nombre: 'Interiores' }, { nombre: 'Edificios' }],
		items: [
			{
				titulo: 'Casa Urubó',
				descripcion: 'Vivienda de una planta con patios interiores y aleros profundos.',
				categoria_nombre: 'Viviendas',
				campo1: '380 m²',
				campo2: 'Urubó',
				campo3: '2024',
				destacado: true,
				imagenes: [
					{ url: foto(I.arquitectura.casaContemporanea), alt: 'Casa contemporánea con jardín' }
				]
			},
			{
				titulo: 'Casa Las Palmas',
				descripcion: 'Dos plantas, fachada ventilada y piscina.',
				categoria_nombre: 'Viviendas',
				campo1: '290 m²',
				campo2: 'Las Palmas',
				campo3: '2023',
				imagenes: [{ url: foto(I.arquitectura.casaDosPisos), alt: 'Casa de dos plantas' }]
			},
			{
				titulo: 'Departamento Equipetrol',
				descripcion: 'Remodelación completa: cocina abierta y luz natural en todo el living.',
				categoria_nombre: 'Interiores',
				campo1: '140 m²',
				campo2: 'Equipetrol',
				campo3: '2025',
				imagenes: [
					{ url: foto(I.arquitectura.interiorModerno), alt: 'Living moderno' },
					{ url: foto(I.arquitectura.interiorCalido), alt: 'Living con tonos cálidos' }
				]
			},
			{
				titulo: 'Torre Sirari',
				descripcion: 'Edificio de oficinas de 12 pisos con certificación de eficiencia energética.',
				categoria_nombre: 'Edificios',
				campo1: '9.600 m²',
				campo2: 'Sirari',
				campo3: '2022',
				imagenes: [{ url: foto(I.arquitectura.edificio), alt: 'Edificio de fachada blanca' }]
			}
		]
	},
	educacion: [
		{
			institucion: 'Universidad Privada de Santa Cruz de la Sierra',
			titulo: 'Licenciatura en Arquitectura',
			fecha_inicio: '2007-02-01',
			fecha_fin: '2012-12-01'
		},
		{
			institucion: 'Universitat Politècnica de Catalunya',
			titulo: 'Máster en Arquitectura Sostenible',
			fecha_inicio: '2014-09-15',
			fecha_fin: '2015-07-30'
		}
	],
	certificaciones: [
		{
			nombre: 'Registro Nacional de Arquitectos',
			entidad_emisora: 'Colegio de Arquitectos de Bolivia',
			codigo_credencial: 'CAB-SC-1290',
			fecha_emision: '2013-02-01',
			no_expira: true
		}
	],
	faq: [
		{
			pregunta: '¿Haces solo el diseño o también la obra?',
			respuesta:
				'Las dos cosas. Puedes contratar solo el proyecto o el proyecto con dirección de obra.'
		},
		{
			pregunta: '¿Cuánto tarda un proyecto de vivienda?',
			respuesta: 'Entre seis y diez semanas desde la primera reunión hasta los planos aprobados.'
		}
	]
};

export const tarjetaDiego: TarjetaNuevaRequest = {
	slug: 'diego-salazar-coach',
	rubro: 'Entrenamiento personal',
	nombres: 'Diego',
	apellidos: 'Salazar',
	cargo: 'Entrenador personal certificado',
	nombre_empresa: 'DS Training',
	acerca_de_mi:
		'Planes de fuerza y acondicionamiento para gente ocupada: sesiones cortas, progresión medida y seguimiento por WhatsApp.',
	profile_url: retrato(I.retratos.diego),
	cover_url: portada(I.deporte.barra),
	logo_empresa_url: logo('DS', 'FACC15', '0F1115'),
	nombre_empresa_posicion: 'izquierda',
	qr_pago_url: qrPago('diego-salazar-coach'),
	is_public: true,
	theme: { preset: 'energia', tipografia: 9 },
	contactos: [
		{ tipo: 'phone', valor: '+591 69876543', etiqueta: 'WhatsApp', is_wpp: true, is_primary: true },
		{ tipo: 'email', valor: 'diego@dstraining.test', is_primary: true }
	],
	ubicaciones: [
		{
			nombre: 'Box DS Training',
			direccion: 'Av. Blanco Galindo km 2, frente al parque',
			ciudad: 'Cochabamba',
			departamento: 'Cochabamba',
			pais: 'Bolivia',
			lat: -17.38201,
			lng: -66.18204,
			horarios: [
				...semana(LUNES_A_VIERNES, ['06:00', '10:00'], ['17:00', '21:00']),
				...semana([6], ['08:00', '12:00'])
			]
		}
	],
	sociales: [
		{
			red: 'instagram',
			url: 'https://instagram.com/ds.training.demo',
			username: 'ds.training.demo'
		},
		{ red: 'tiktok', url: 'https://tiktok.com/@diegosalazar.demo', username: 'diegosalazar.demo' },
		{ red: 'youtube', url: 'https://youtube.com/@dstrainingdemo' }
	],
	vitrina: {
		mostrar_precios: true,
		moneda: 'BOB',
		campo1_nombre: 'Frecuencia',
		categorias: [{ nombre: 'Presencial' }, { nombre: 'En línea' }],
		items: [
			{
				titulo: 'Plan fuerza 5 días',
				descripcion: 'Entrenamiento guiado en el box con evaluación cada mes.',
				categoria_nombre: 'Presencial',
				precio: 650,
				precio_anterior: 750,
				precio_etiqueta: 'por mes',
				campo1: '5 días por semana',
				destacado: true,
				imagenes: [{ url: foto(I.deporte.barra), alt: 'Levantamiento con barra' }]
			},
			{
				titulo: 'Plan fuerza 3 días',
				descripcion: 'Para empezar o mantener el ritmo con poco tiempo.',
				categoria_nombre: 'Presencial',
				precio: 450,
				precio_etiqueta: 'por mes',
				campo1: '3 días por semana',
				imagenes: [{ url: foto(I.deporte.entrenamiento), alt: 'Entrenamiento en el gimnasio' }]
			},
			{
				titulo: 'Entrenamiento en línea',
				descripcion: 'Rutina semanal en video y correcciones por mensaje.',
				categoria_nombre: 'En línea',
				precio: 300,
				precio_etiqueta: 'por mes',
				campo1: 'A tu ritmo',
				imagenes: [{ url: foto(I.deporte.ejercicioCasa), alt: 'Ejercicio en casa' }]
			},
			{
				titulo: 'Evaluación física',
				descripcion: 'Composición corporal, movilidad y test de fuerza.',
				categoria_nombre: 'Presencial',
				precio: 120,
				campo1: 'Una sesión',
				imagenes: [{ url: foto(I.deporte.zapatillas), alt: 'Atándose las zapatillas' }]
			}
		]
	},
	certificaciones: [
		{
			nombre: 'Entrenador personal certificado',
			entidad_emisora: 'Asociación Internacional de Ciencias del Ejercicio',
			codigo_credencial: 'AICE-30455',
			url_credencial: 'https://aice.test/verificar/AICE-30455',
			fecha_emision: '2023-09-01',
			fecha_expiracion: '2027-09-01'
		}
	],
	faq: [
		{
			pregunta: '¿Necesito experiencia previa?',
			respuesta: 'No. La evaluación inicial define el punto de partida y las cargas de tu plan.'
		},
		{
			pregunta: '¿Puedo congelar el plan si viajo?',
			respuesta: 'Sí, hasta dos semanas por mes, avisando con un día de anticipación.'
		}
	]
};

/** Borrador: todavía no publicada */
export const tarjetaPaola: TarjetaNuevaRequest = {
	slug: 'paola-estilista',
	rubro: 'Peluquería y colorimetría',
	nombres: 'Paola',
	apellidos: 'Gutiérrez',
	cargo: 'Estilista y colorista',
	nombre_empresa: 'Studio Paola G.',
	acerca_de_mi: 'Color, cortes y peinados para eventos. Trabajo con productos sin amoníaco.',
	profile_url: retrato(I.retratos.paola),
	cover_url: portada(I.belleza.salon),
	nombre_empresa_posicion: 'abajo',
	is_public: false,
	theme: { preset: 'belleza', tipografia: 7 },
	contactos: [
		{ tipo: 'phone', valor: '+591 78812345', etiqueta: 'Citas', is_wpp: true, is_primary: true }
	],
	ubicaciones: [
		{
			nombre: 'Studio',
			direccion: 'Av. San Martín 820, local 4',
			ciudad: 'Santa Cruz de la Sierra',
			departamento: 'Santa Cruz',
			pais: 'Bolivia',
			lat: -17.76402,
			lng: -63.19513,
			horarios: semana([2, 3, 4, 5, 6], ['10:00', '19:00'])
		}
	],
	sociales: [
		{
			red: 'instagram',
			url: 'https://instagram.com/studiopaolag.demo',
			username: 'studiopaolag.demo'
		},
		{ red: 'tiktok', url: 'https://tiktok.com/@studiopaolag.demo', username: 'studiopaolag.demo' }
	],
	vitrina: {
		mostrar_precios: true,
		moneda: 'BOB',
		items: [
			{
				titulo: 'Balayage',
				descripcion: 'Iluminación a mano alzada con matizado y tratamiento.',
				precio: 450,
				precio_etiqueta: 'Desde',
				destacado: true,
				imagenes: [{ url: foto(I.belleza.cabello), alt: 'Cabello con ondas' }]
			},
			{
				titulo: 'Corte y peinado',
				precio: 120,
				imagenes: [{ url: foto(I.belleza.corte), alt: 'Estilista cortando el cabello' }]
			},
			{
				titulo: 'Maquillaje social',
				precio: 250,
				imagenes: [{ url: foto(I.belleza.maquillaje), alt: 'Maquillaje de ojos' }]
			},
			{
				titulo: 'Keratina',
				descripcion: 'Alisado y brillo que dura hasta cuatro meses.',
				precio: 380,
				imagenes: [{ url: foto(I.belleza.herramientas), alt: 'Herramientas de peluquería' }]
			}
		]
	}
};
