import type { TarjetaNuevaRequest } from '#lib/interfaces/index.ts';
import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
import { IMAGENES as I, LUNES_A_VIERNES, foto, logo, portada, retrato, semana } from '../recursos';

/** Tarjetas de prueba: inmobiliaria, logística, derecho y contabilidad */

export const tarjetaValeria: TarjetaNuevaRequest = {
	slug: 'valeria-rojas',
	rubro: 'Agente inmobiliario',
	nombres: 'Valeria',
	apellidos: 'Rojas Suárez',
	cargo: 'Agente inmobiliaria',
	nombre_empresa: 'Horizonte Propiedades',
	acerca_de_mi:
		'Te ayudo a comprar, vender o alquilar en Santa Cruz sin sorpresas: tasación, visitas, papeles y negociación. Cada semana publico aquí las propiedades nuevas.',
	profile_url: retrato(I.retratos.valeria),
	cover_url: portada(I.inmuebles.casaModernaNoche),
	logo_empresa_url: logo('Horizonte', '1C1917', 'F5E6C8'),
	nombre_empresa_posicion: 'derecha',
	is_public: true,
	theme: { preset: 'elegante', tipografia: 3 },
	contactos: [
		{ tipo: 'phone', valor: '+591 76543210', etiqueta: 'Celular', is_wpp: true, is_primary: true },
		{ tipo: 'email', valor: 'valeria@horizontepropiedades.test', is_primary: true },
		{ tipo: 'website', valor: 'www.horizontepropiedades.test' }
	],
	ubicaciones: [
		{
			nombre: 'Oficina Equipetrol',
			direccion: 'Av. San Martín 1580, edificio Cosmopolitan, piso 5',
			ciudad: 'Santa Cruz de la Sierra',
			departamento: 'Santa Cruz',
			pais: 'Bolivia',
			lat: -17.76391,
			lng: -63.19602,
			horarios: [...semana(LUNES_A_VIERNES, ['09:00', '18:30']), ...semana([6], ['09:30', '13:00'])]
		}
	],
	sociales: [
		{
			red: 'instagram',
			url: 'https://instagram.com/valeria.propiedades.demo',
			username: 'valeria.propiedades.demo'
		},
		{ red: 'facebook', url: 'https://facebook.com/horizontepropiedades.demo' },
		{
			red: 'tiktok',
			url: 'https://tiktok.com/@valeria.casas.demo',
			username: 'valeria.casas.demo'
		},
		{ red: 'linkedin', url: 'https://linkedin.com/in/valeria-rojas-demo' }
	],
	vitrina: {
		mostrar_precios: true,
		moneda: 'USD',
		campo1_nombre: 'Dormitorios',
		campo2_nombre: 'Baños',
		campo3_nombre: 'Superficie',
		campo4_nombre: 'Zona',
		categorias: [{ nombre: 'Venta' }, { nombre: 'Alquiler' }, { nombre: 'Anticrético' }],
		items: [
			{
				titulo: 'Casa moderna con piscina',
				descripcion:
					'Cuatro suites, galería con parrillero y jardín de 600 m² en condominio cerrado.',
				categoria_nombre: 'Venta',
				precio: 285000,
				campo1: '4',
				campo2: '5',
				campo3: '420 m²',
				campo4: 'Urubó',
				destacado: true,
				imagenes: [
					{ url: foto(I.inmuebles.casaPiscina), alt: 'Fachada de la casa con piscina' },
					{ url: foto(I.inmuebles.salaAmplia), alt: 'Living con doble altura' },
					{ url: foto(I.inmuebles.dormitorio), alt: 'Dormitorio principal' }
				]
			},
			{
				titulo: 'Departamento en Equipetrol',
				descripcion: 'Piso alto con vista a la ciudad, a dos cuadras de la avenida San Martín.',
				categoria_nombre: 'Venta',
				precio: 128000,
				precio_anterior: 139000,
				campo1: '2',
				campo2: '2',
				campo3: '95 m²',
				campo4: 'Equipetrol',
				imagenes: [
					{ url: foto(I.inmuebles.departamento), alt: 'Living y comedor del departamento' }
				]
			},
			{
				titulo: 'Departamento amoblado',
				descripcion: 'Listo para entrar: cocina equipada, lavandería y parqueo.',
				categoria_nombre: 'Alquiler',
				precio: 850,
				precio_etiqueta: 'por mes',
				campo1: '1',
				campo2: '1',
				campo3: '62 m²',
				campo4: 'Las Palmas',
				imagenes: [{ url: foto(I.inmuebles.living), alt: 'Living luminoso con plantas' }]
			},
			{
				titulo: 'Casa en condominio',
				descripcion: 'Tres dormitorios, piscina común y seguridad las 24 horas.',
				categoria_nombre: 'Anticrético',
				precio: 60000,
				campo1: '3',
				campo2: '3',
				campo3: '250 m²',
				campo4: 'Av. Banzer',
				imagenes: [
					{ url: foto(I.inmuebles.casaCondominio), alt: 'Casa de dos plantas con piscina' }
				]
			}
		]
	},
	certificaciones: [
		{
			nombre: 'Corredora inmobiliaria matriculada',
			entidad_emisora: 'Cámara Inmobiliaria de Santa Cruz',
			codigo_credencial: 'CISC-0417',
			fecha_emision: '2018-06-01',
			no_expira: true
		}
	],
	faq: [
		{
			pregunta: '¿Cómo funciona el anticrético?',
			respuesta:
				'Entregas un monto al propietario por un plazo fijo y vives sin pagar alquiler. Al terminar, te devuelve el total. Reviso el contrato y el registro en Derechos Reales.'
		},
		{
			pregunta: '¿Cobras comisión al comprador?',
			respuesta: 'No. La comisión la paga quien vende o alquila la propiedad.'
		}
	]
};

export const tarjetaAndres: TarjetaNuevaRequest = {
	slug: 'andres-quiroga',
	rubro: 'Logística',
	nombres: 'Andrés',
	apellidos: 'Quiroga',
	cargo: 'Gerente comercial',
	nombre_empresa: 'Andina Logística',
	acerca_de_mi:
		'Coordino el transporte y la logística de empresas que importan y distribuyen en Bolivia. Si necesitas mover carga entre ciudades o desde un puerto, armamos la ruta y te cotizamos en el día.',
	profile_url: retrato(I.retratos.andres),
	cover_url: portada(I.empresa.puerto),
	logo_empresa_url: logo('Andina Logística', '1E3A8A'),
	nombre_empresa_posicion: 'izquierda',
	is_public: true,
	theme: { preset: 'corporativo', tipografia: 5 },
	contactos: [
		{ tipo: 'phone', valor: '+591 77712340', etiqueta: 'Celular', is_wpp: true, is_primary: true },
		{ tipo: 'phone', valor: '3 3554400', etiqueta: 'Central' },
		{ tipo: 'email', valor: 'aquiroga@andinalogistica.test', is_primary: true },
		{ tipo: 'website', valor: 'www.andinalogistica.test' }
	],
	ubicaciones: [
		{
			nombre: 'Centro logístico',
			direccion: 'Parque Industrial, manzana 14',
			ciudad: 'Santa Cruz de la Sierra',
			departamento: 'Santa Cruz',
			pais: 'Bolivia',
			lat: -17.73004,
			lng: -63.14412,
			horarios: [...semana(LUNES_A_VIERNES, ['08:00', '18:00']), ...semana([6], ['08:00', '12:00'])]
		},
		{
			nombre: 'Oficina La Paz',
			direccion: 'Av. Arce 2631, edificio Multicine, piso 9',
			ciudad: 'La Paz',
			departamento: 'La Paz',
			pais: 'Bolivia',
			lat: -16.510421,
			lng: -68.122819,
			horarios: semana(LUNES_A_VIERNES, ['08:30', '17:30'])
		}
	],
	sociales: [{ red: 'linkedin', url: 'https://linkedin.com/in/andres-quiroga-demo' }],
	vitrina: {
		mostrar_precios: false,
		campo1_nombre: 'Cobertura',
		items: [
			{
				titulo: 'Transporte de carga nacional',
				descripcion: 'Camiones de 10 a 30 toneladas con seguimiento satelital.',
				campo1: 'Todo el país',
				destacado: true,
				imagenes: [{ url: foto(I.empresa.camionScania), alt: 'Camión de carga en ruta' }]
			},
			{
				titulo: 'Importación y despacho aduanero',
				descripcion:
					'Desde Arica, Iquique o Santos hasta tu almacén, con trámite aduanero incluido.',
				campo1: 'Puertos del Pacífico y Atlántico',
				imagenes: [{ url: foto(I.empresa.puerto), alt: 'Puerto de contenedores' }]
			},
			{
				titulo: 'Almacenaje y distribución',
				descripcion: 'Bodega con control de inventario y entregas programadas.',
				campo1: 'Santa Cruz y La Paz',
				imagenes: [{ url: foto(I.empresa.almacen), alt: 'Almacén con estanterías' }]
			},
			{
				titulo: 'Carga por carretera internacional',
				descripcion: 'Rutas a Chile, Perú, Argentina y Brasil.',
				campo1: 'Sudamérica',
				imagenes: [{ url: foto(I.empresa.camionRuta), alt: 'Camión en una carretera de montaña' }]
			}
		]
	},
	educacion: [
		{
			institucion: 'Universidad Privada de Santa Cruz de la Sierra',
			titulo: 'Ingeniería Comercial',
			fecha_inicio: '2006-02-01',
			fecha_fin: '2010-12-01'
		},
		{
			institucion: 'INCAE Business School',
			titulo: 'Maestría en Administración de Empresas',
			fecha_inicio: '2014-01-15',
			fecha_fin: '2015-12-15'
		}
	],
	faq: [
		{
			pregunta: '¿En cuánto tiempo me cotizan?',
			respuesta: 'Si nos escribes antes de las 15:00, recibes la cotización ese mismo día.'
		},
		{
			pregunta: '¿La carga va asegurada?',
			respuesta: 'Sí, todos los envíos tienen seguro contra todo riesgo durante el trayecto.'
		}
	]
};

const corporativo = TEMAS_TARJETA.corporativo.colores;

export const tarjetaMariana: TarjetaNuevaRequest = {
	slug: 'mariana-ortiz',
	rubro: 'Abogacía corporativa',
	nombres: 'Mariana',
	apellidos: 'Ortiz Calderón',
	cargo: 'Abogada corporativa',
	nombre_empresa: 'Ortiz & Asociados',
	acerca_de_mi:
		'Asesoro a empresas en constitución, contratos, temas laborales y marcas. Trabajo con un equipo pequeño: siempre hablas conmigo y sabes en qué está tu caso.',
	profile_url: retrato(I.retratos.mariana),
	cover_url: portada(I.empresa.justicia),
	logo_empresa_url: logo('Ortiz Asociados', '1F4D3A'),
	nombre_empresa_posicion: 'abajo',
	is_public: true,
	// Parte del preset corporativo y lo pasa a un verde sobrio
	theme: {
		...corporativo,
		preset: 'corporativo',
		tipografia: 3,
		color_titulo: '#13261D',
		color_primario: '#1F4D3A',
		color_texto_sobre_primario: '#FFFFFF',
		color_secundario: '#E3EDE7',
		color_texto_sobre_secundario: '#1F4D3A',
		color_overlay_portada: '#13261D',
		overlay_opacidad: 55,
		color_precio: '#1F4D3A',
		color_destacado: '#C9A86A',
		color_texto_sobre_destacado: '#13261D',
		color_icono: '#1F4D3A',
		color_fondo_icono: '#E3EDE7',
		icono_forma: 'cuadrado',
		color_fab_fondo: '#1F4D3A',
		color_fab_icono: '#FFFFFF'
	},
	secciones: [{ clave: 'vitrina', titulo: 'Áreas de práctica' }],
	contactos: [
		{ tipo: 'phone', valor: '+591 72098765', etiqueta: 'Celular', is_wpp: true, is_primary: true },
		{ tipo: 'phone', valor: '2 2791234', etiqueta: 'Oficina' },
		{ tipo: 'email', valor: 'mortiz@ortizasociados.test', is_primary: true }
	],
	ubicaciones: [
		{
			nombre: 'Estudio jurídico',
			direccion: 'Av. Ballivián 1240, Calacoto, piso 8',
			ciudad: 'La Paz',
			departamento: 'La Paz',
			pais: 'Bolivia',
			lat: -16.538012,
			lng: -68.083811,
			horarios: semana(LUNES_A_VIERNES, ['08:30', '12:30'], ['14:30', '18:30'])
		}
	],
	sociales: [
		{ red: 'linkedin', url: 'https://linkedin.com/in/mariana-ortiz-demo' },
		{ red: 'x', url: 'https://x.com/marianaortiz_demo', username: 'marianaortiz_demo' }
	],
	vitrina: {
		mostrar_precios: false,
		items: [
			{
				titulo: 'Derecho societario',
				descripcion: 'Constitución de empresas, actas, aumentos de capital y fusiones.',
				destacado: true,
				imagenes: [{ url: foto(I.empresa.firma), alt: 'Firma de documentos' }]
			},
			{
				titulo: 'Contratos comerciales',
				descripcion: 'Redacción y revisión de contratos de distribución, servicios y alquiler.',
				imagenes: [{ url: foto(I.empresa.contrato), alt: 'Contrato sobre un escritorio' }]
			},
			{
				titulo: 'Derecho laboral empresarial',
				descripcion: 'Contratos de trabajo, reglamentos internos y conciliaciones.',
				imagenes: [{ url: foto(I.empresa.biblioteca), alt: 'Biblioteca jurídica' }]
			},
			{
				titulo: 'Registro de marcas',
				descripcion: 'Búsqueda, registro y defensa de tu marca ante SENAPI.'
			}
		]
	},
	educacion: [
		{
			institucion: 'Universidad Mayor de San Andrés',
			titulo: 'Licenciatura en Derecho',
			fecha_inicio: '2005-02-01',
			fecha_fin: '2010-11-30'
		},
		{
			institucion: 'Universidad Privada Boliviana',
			titulo: 'Maestría en Derecho Empresarial',
			fecha_inicio: '2012-03-01',
			fecha_fin: '2014-02-28'
		}
	],
	certificaciones: [
		{
			nombre: 'Matrícula profesional de abogada',
			entidad_emisora: 'Ministerio de Justicia',
			codigo_credencial: 'RPA-8812',
			fecha_emision: '2011-03-15',
			no_expira: true
		}
	],
	faq: [
		{
			pregunta: '¿Cuánto cuesta constituir una empresa?',
			respuesta:
				'Depende del tipo de sociedad. En la primera reunión te doy un presupuesto cerrado.'
		},
		{
			pregunta: '¿Atiendes empresas de otras ciudades?',
			respuesta: 'Sí. La mayoría de los trámites se hacen en línea y viajo cuando hace falta.'
		}
	]
};

/** Tarjeta de una cuenta desactivada: no se ve en público aunque esté publicada */
export const tarjetaJorge: TarjetaNuevaRequest = {
	slug: 'jorge-mamani-contador',
	rubro: 'Contaduría pública',
	prefijo: 'Lic.',
	nombres: 'Jorge',
	apellidos: 'Mamani',
	cargo: 'Contador público',
	acerca_de_mi: 'Contabilidad, impuestos y planillas para pequeñas empresas.',
	profile_url: retrato(I.retratos.jorge),
	is_public: true,
	contactos: [{ tipo: 'phone', valor: '+591 79900112', is_wpp: true, is_primary: true }]
};
