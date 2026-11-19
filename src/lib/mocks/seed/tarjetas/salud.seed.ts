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

/** Tarjetas de prueba del rubro salud */

export const tarjetaFabiola: TarjetaNuevaRequest = {
	slug: 'doctora-fabiola',
	rubro: 'Pediatría',
	prefijo: 'Dra.',
	nombres: 'Fabiola',
	apellidos: 'Mendoza Rojas',
	cargo: 'Pediatra y neonatóloga',
	nombre_empresa: 'Consultorio Pediátrico Crecer',
	acerca_de_mi:
		'Acompaño a las familias desde el primer control del recién nacido hasta la adolescencia. Atiendo controles de niño sano, vacunas, alergias y urgencias pediátricas en dos consultorios de Santa Cruz, de lunes a sábado.',
	profile_url: retrato(I.retratos.fabiola),
	cover_url: portada(I.salud.ninaSonriendo),
	logo_empresa_url: logo('Crecer', '0F766E'),
	nombre_empresa_posicion: 'abajo',
	qr_pago_url: qrPago('doctora-fabiola'),
	is_public: true,
	theme: { preset: 'salud', tipografia: 4 },
	secciones: [{ clave: 'vitrina', titulo: 'Consultas y servicios' }],
	contactos: [
		{
			tipo: 'phone',
			valor: '+591 70012345',
			etiqueta: 'Citas y WhatsApp',
			is_wpp: true,
			is_primary: true
		},
		{ tipo: 'phone', valor: '3 3412345', etiqueta: 'Consultorio Equipetrol' },
		{ tipo: 'email', valor: 'citas@pediatriacrecer.test', etiqueta: 'Citas', is_primary: true },
		{ tipo: 'website', valor: 'www.pediatriacrecer.test', etiqueta: 'Sitio web' }
	],
	ubicaciones: [
		{
			nombre: 'Consultorio Equipetrol',
			direccion: 'Calle Las Palmeras 245, piso 2',
			ciudad: 'Santa Cruz de la Sierra',
			departamento: 'Santa Cruz',
			pais: 'Bolivia',
			lat: -17.765127,
			lng: -63.196541,
			horarios: [
				...semana(LUNES_A_VIERNES, ['08:30', '12:30'], ['15:00', '19:00']),
				...semana([6], ['09:00', '13:00'])
			]
		},
		{
			nombre: 'Torre Médica Norte',
			direccion: 'Av. Banzer, 4.º anillo, consultorio 12',
			ciudad: 'Santa Cruz de la Sierra',
			departamento: 'Santa Cruz',
			pais: 'Bolivia',
			lat: -17.74583,
			lng: -63.17241,
			horarios: semana([2, 4], ['16:00', '20:00'])
		}
	],
	sociales: [
		{
			red: 'instagram',
			url: 'https://instagram.com/dra.fabiola.pediatra',
			username: 'dra.fabiola.pediatra'
		},
		{ red: 'facebook', url: 'https://facebook.com/pediatriacrecer', username: 'pediatriacrecer' },
		{ red: 'doctoralia', url: 'https://www.doctoralia.com.bo/fabiola-mendoza-demo' }
	],
	vitrina: {
		mostrar_precios: true,
		moneda: 'BOB',
		campo1_nombre: 'Duración',
		categorias: [{ nombre: 'Consultas' }, { nombre: 'Prevención' }],
		items: [
			{
				titulo: 'Control de niño sano',
				descripcion: 'Peso, talla, desarrollo y orientación en alimentación para cada etapa.',
				categoria_nombre: 'Consultas',
				precio: 200,
				campo1: '40 minutos',
				destacado: true,
				imagenes: [
					{ url: foto(I.salud.ninaSonriendo), alt: 'Niña sonriendo después de su control' }
				]
			},
			{
				titulo: 'Control del recién nacido',
				descripcion: 'Primera revisión en casa o en consultorio, lactancia y cuidados del ombligo.',
				categoria_nombre: 'Consultas',
				precio: 220,
				precio_anterior: 260,
				campo1: '50 minutos',
				imagenes: [{ url: foto(I.salud.estetoscopio), alt: 'Pediatra con estetoscopio' }]
			},
			{
				titulo: 'Consulta de urgencia',
				descripcion: 'Fiebre, vómitos o dificultad para respirar: te atiendo el mismo día.',
				categoria_nombre: 'Consultas',
				precio: 250,
				campo1: '30 minutos',
				imagenes: [{ url: foto(I.salud.consultaDigital), alt: 'Estetoscopio junto a una laptop' }]
			},
			{
				titulo: 'Aplicación de vacunas',
				descripcion: 'Esquema nacional y vacunas complementarias, con registro en el carnet.',
				categoria_nombre: 'Prevención',
				precio: null,
				imagenes: [{ url: foto(I.salud.equipoMedico), alt: 'Equipo médico revisando un caso' }]
			}
		]
	},
	educacion: [
		{
			institucion: 'Universidad Autónoma Gabriel René Moreno',
			titulo: 'Médica cirujana',
			area_estudio: 'Medicina',
			fecha_inicio: '2004-02-01',
			fecha_fin: '2010-12-15'
		},
		{
			institucion: 'Hospital de Niños Dr. Mario Ortiz Suárez',
			titulo: 'Especialidad en Pediatría',
			fecha_inicio: '2012-03-01',
			fecha_fin: '2015-02-28'
		},
		{
			institucion: 'Universidad de Buenos Aires',
			titulo: 'Subespecialidad en Neonatología',
			fecha_inicio: '2016-03-01',
			fecha_fin: '2017-12-20'
		}
	],
	certificaciones: [
		{
			nombre: 'Miembro titular',
			entidad_emisora: 'Sociedad Boliviana de Pediatría',
			codigo_credencial: 'SBP-2381',
			url_credencial: 'https://sbp.test/miembros/SBP-2381',
			fecha_emision: '2016-05-10',
			no_expira: true
		},
		{
			nombre: 'Reanimación neonatal (NRP)',
			entidad_emisora: 'Academia Americana de Pediatría',
			codigo_credencial: 'NRP-77412',
			fecha_emision: '2025-03-02',
			fecha_expiracion: '2027-03-02'
		}
	],
	faq: [
		{
			pregunta: '¿Atiendes urgencias fuera de horario?',
			respuesta:
				'Escríbeme por WhatsApp: te digo si conviene ir a emergencias o si puedes venir al consultorio al día siguiente.'
		},
		{
			pregunta: '¿Qué llevo a la primera consulta?',
			respuesta:
				'El carnet de vacunas, el informe de alta del recién nacido si lo tienes y la lista de medicamentos que toma.'
		},
		{
			pregunta: '¿Trabajas con seguros médicos?',
			respuesta:
				'Con la mayoría de los seguros privados. Escríbeme el nombre del tuyo y te confirmo.'
		}
	]
};

export const tarjetaCamila: TarjetaNuevaRequest = {
	slug: 'dra-camila-rivas',
	rubro: 'Odontología',
	prefijo: 'Dra.',
	photo_usuario_url: retrato(I.retratos.camila),
	nombres: 'Camila',
	apellidos: 'Rivas',
	cargo: 'Odontóloga en estética dental',
	nombre_empresa: 'Clínica Sonríe',
	acerca_de_mi:
		'Diseño de sonrisa, blanqueamiento y ortodoncia invisible. Atiendo con turnos de lunes a sábado y te muestro el plan digital de tu tratamiento antes de empezar.',
	profile_url: retrato(I.retratos.camila),
	cover_url: portada(I.salud.dentistaRadiografia),
	logo_empresa_url: logo('Clínica Sonríe', 'F472B6', '3B0A24'),
	nombre_empresa_posicion: 'arriba',
	qr_pago_url: qrPago('dra-camila-rivas'),
	is_public: true,
	theme: { preset: 'salud', tipografia: 1, icono_forma: 'redondeado' },
	contactos: [
		{ tipo: 'phone', valor: '+591 70123456', etiqueta: 'WhatsApp', is_wpp: true, is_primary: true },
		{ tipo: 'email', valor: 'hola@clinicasonrie.test', is_primary: true }
	],
	ubicaciones: [
		{
			nombre: 'Consultorio Centro',
			direccion: 'Calle 7 Oeste 23, piso 2',
			ciudad: 'Santa Cruz de la Sierra',
			departamento: 'Santa Cruz',
			pais: 'Bolivia',
			lat: -17.78612,
			lng: -63.18934,
			horarios: [...semana(LUNES_A_VIERNES, ['09:00', '20:00']), ...semana([6], ['09:00', '14:00'])]
		}
	],
	sociales: [
		{
			red: 'instagram',
			url: 'https://instagram.com/clinicasonrie.demo',
			username: 'clinicasonrie.demo'
		},
		{
			red: 'tiktok',
			url: 'https://tiktok.com/@clinicasonrie.demo',
			username: 'clinicasonrie.demo'
		},
		{ red: 'calendly', url: 'https://calendly.com/clinica-sonrie-demo' }
	],
	vitrina: {
		mostrar_precios: true,
		moneda: 'BOB',
		campo1_nombre: 'Sesiones',
		items: [
			{
				titulo: 'Diseño de sonrisa',
				descripcion: 'Evaluación y plan digital antes de empezar.',
				precio: 3100,
				precio_etiqueta: 'Desde',
				campo1: '3 a 4',
				destacado: true,
				imagenes: [{ url: foto(I.salud.revisionDental), alt: 'Revisión dental' }]
			},
			{
				titulo: 'Blanqueamiento LED',
				descripcion: 'Una sesión de 60 minutos con resultados desde el primer día.',
				precio: 850,
				precio_anterior: 1000,
				campo1: '1',
				imagenes: [
					{ url: foto(I.salud.dentistaRadiografia), alt: 'Odontóloga revisando una radiografía' }
				]
			},
			{
				titulo: 'Ortodoncia invisible',
				descripcion: 'Alineadores transparentes con controles mensuales.',
				precio: 9800,
				precio_etiqueta: 'Desde',
				campo1: '12 a 18 meses',
				imagenes: [{ url: foto(I.salud.alineadorDental), alt: 'Alineador dental transparente' }]
			},
			{
				titulo: 'Limpieza y profilaxis',
				descripcion: 'Limpieza profunda, pulido y aplicación de flúor.',
				precio: 250,
				campo1: '1'
			}
		]
	},
	educacion: [
		{
			institucion: 'Universidad Autónoma Gabriel René Moreno',
			titulo: 'Cirujana dentista',
			fecha_inicio: '2009-02-01',
			fecha_fin: '2014-12-10'
		},
		{
			institucion: 'Universidad de Chile',
			titulo: 'Diplomado en estética dental',
			fecha_inicio: '2017-04-01',
			fecha_fin: '2018-03-30'
		}
	],
	faq: [
		{
			pregunta: '¿El blanqueamiento daña el esmalte?',
			respuesta:
				'No. Uso geles de baja concentración y te doy indicaciones para evitar la sensibilidad.'
		},
		{
			pregunta: '¿Puedo pagar el tratamiento en cuotas?',
			respuesta:
				'Sí, el diseño de sonrisa y la ortodoncia se pagan en cuotas mensuales sin interés.'
		}
	]
};

export const tarjetaAndrea: TarjetaNuevaRequest = {
	slug: 'psicologa-andrea-vargas',
	rubro: 'Psicología clínica',
	prefijo: 'Lic.',
	nombres: 'Andrea',
	apellidos: 'Vargas Peñaranda',
	cargo: 'Psicóloga clínica',
	nombre_empresa: 'Espacio Sereno',
	acerca_de_mi:
		'Trabajo con adultos y parejas que atraviesan ansiedad, duelos o cambios difíciles. Mi enfoque es cognitivo-conductual: sesiones claras, con objetivos que revisamos juntos.',
	profile_url: retrato(I.retratos.andrea),
	cover_url: portada(I.bienestar.montanas),
	nombre_empresa_posicion: 'abajo',
	is_public: true,
	theme: { preset: 'natural', tipografia: 2 },
	contactos: [
		{ tipo: 'phone', valor: '+591 71234098', etiqueta: 'Turnos', is_wpp: true, is_primary: true },
		{ tipo: 'email', valor: 'andrea@espaciosereno.test', is_primary: true }
	],
	ubicaciones: [
		{
			nombre: 'Consultorio Sopocachi',
			direccion: 'Calle Rosendo Gutiérrez 452, oficina 3B',
			ciudad: 'La Paz',
			departamento: 'La Paz',
			pais: 'Bolivia',
			lat: -16.510312,
			lng: -68.126034,
			horarios: [...semana(LUNES_A_VIERNES, ['14:00', '20:00']), ...semana([6], ['09:00', '13:00'])]
		}
	],
	sociales: [
		{
			red: 'instagram',
			url: 'https://instagram.com/espaciosereno.demo',
			username: 'espaciosereno.demo'
		},
		{ red: 'linkedin', url: 'https://linkedin.com/in/andrea-vargas-demo' },
		{ red: 'calendly', url: 'https://calendly.com/andrea-vargas-demo' }
	],
	vitrina: {
		mostrar_precios: true,
		moneda: 'BOB',
		campo1_nombre: 'Duración',
		items: [
			{
				titulo: 'Terapia individual',
				descripcion: 'Para ansiedad, estrés, duelo o autoestima.',
				precio: 250,
				precio_etiqueta: 'por sesión',
				campo1: '50 minutos',
				destacado: true,
				imagenes: [{ url: foto(I.bienestar.manos), alt: 'Manos que se sostienen' }]
			},
			{
				titulo: 'Terapia de pareja',
				descripcion: 'Comunicación, acuerdos y crisis de pareja.',
				precio: 350,
				precio_etiqueta: 'por sesión',
				campo1: '75 minutos',
				imagenes: [{ url: foto(I.bienestar.conversacion), alt: 'Dos personas conversando' }]
			},
			{
				titulo: 'Sesión en línea',
				descripcion: 'Por videollamada, desde cualquier ciudad.',
				precio: 220,
				precio_etiqueta: 'por sesión',
				campo1: '50 minutos',
				imagenes: [{ url: foto(I.bienestar.videollamada), alt: 'Videollamada en una laptop' }]
			},
			{
				titulo: 'Taller de manejo de ansiedad',
				descripcion: 'Cuatro encuentros grupales con ejercicios para la semana.',
				precio: 400,
				campo1: '4 sábados',
				imagenes: [{ url: foto(I.bienestar.meditacion), alt: 'Persona meditando' }]
			}
		]
	},
	educacion: [
		{
			institucion: 'Universidad Mayor de San Andrés',
			titulo: 'Licenciatura en Psicología',
			fecha_inicio: '2008-02-01',
			fecha_fin: '2013-07-30'
		},
		{
			institucion: 'Universidad Católica Boliviana',
			titulo: 'Maestría en Psicología Clínica',
			fecha_inicio: '2015-03-01',
			fecha_fin: '2017-02-28'
		}
	],
	certificaciones: [
		{
			nombre: 'Terapia cognitivo-conductual',
			entidad_emisora: 'Instituto de Terapia Cognitiva',
			codigo_credencial: 'ITC-5590',
			fecha_emision: '2019-08-15',
			no_expira: true
		}
	],
	faq: [
		{
			pregunta: '¿Cuánto dura un proceso de terapia?',
			respuesta:
				'Depende de lo que te trae. Revisamos los objetivos cada ocho sesiones y decidimos juntos cómo seguir.'
		},
		{
			pregunta: '¿Las sesiones en línea funcionan igual?',
			respuesta: 'Sí. Solo necesitas un lugar tranquilo y buena conexión; el encuadre es el mismo.'
		},
		{
			pregunta: '¿Lo que hablamos es confidencial?',
			respuesta:
				'Siempre. Solo se rompe la confidencialidad si hay riesgo para tu vida o la de otra persona.'
		}
	]
};
