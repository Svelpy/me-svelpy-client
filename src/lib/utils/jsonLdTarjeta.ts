import { schemaDeRubro } from '#lib/config/rubros.config.ts';
import type { TarjetaPublica, TarjetaUbicacion } from '#lib/interfaces/index.ts';
import { numeroInternacional, websiteUrl } from './contacto';
import { horaCorta } from './horarios';
import { imagenSeoTarjeta } from './seoTarjeta';
import {
	contactoPrincipal,
	contactosDeTipo,
	nombreCompleto,
	ordenar,
	tituloSeccion
} from './tarjeta';

/**
 * Datos estructurados (JSON-LD, Schema.org) de una tarjeta pública: lo que leen Google y las IAs
 * (GEO). Un @graph con la persona, su negocio (con el tipo de su rubro, direcciones, horarios y
 * catálogo) y sus preguntas frecuentes. Solo usa datos visibles.
 */

const DIAS_SCHEMA = [
	'',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday'
];

function direccion(ubicacion: TarjetaUbicacion) {
	return {
		'@type': 'PostalAddress',
		streetAddress: ubicacion.direccion,
		...(ubicacion.ciudad && { addressLocality: ubicacion.ciudad }),
		...(ubicacion.departamento && { addressRegion: ubicacion.departamento }),
		...(ubicacion.pais && { addressCountry: ubicacion.pais })
	};
}

function coordenadas(ubicacion: TarjetaUbicacion) {
	return ubicacion.lat !== null && ubicacion.lng !== null
		? { '@type': 'GeoCoordinates', latitude: ubicacion.lat, longitude: ubicacion.lng }
		: undefined;
}

function horarios(ubicacion: TarjetaUbicacion) {
	return ubicacion.horarios.map((franja) => ({
		'@type': 'OpeningHoursSpecification',
		dayOfWeek: `https://schema.org/${DIAS_SCHEMA[franja.dia_semana]}`,
		opens: horaCorta(franja.hora_inicio),
		closes: horaCorta(franja.hora_fin)
	}));
}

/** Imagen absoluta o nada (las data: de los datos de prueba no sirven fuera de la página) */
function imagen(url: string | null): string | undefined {
	return url && !url.startsWith('data:') ? url : undefined;
}

export function construirJsonLd(tarjeta: TarjetaPublica, url: string): Record<string, unknown> {
	const visibles = new Set(tarjeta.secciones.filter((s) => s.is_visible).map((s) => s.clave));
	const personaId = `${url}#persona`;
	const negocioId = `${url}#negocio`;

	const telefono = contactoPrincipal(tarjeta.contactos, 'phone');
	const correo = contactoPrincipal(tarjeta.contactos, 'email');
	const sitios = contactosDeTipo(tarjeta.contactos, 'website').map((s) => websiteUrl(s.valor));
	const redes = visibles.has('redes')
		? ordenar(tarjeta.sociales)
				.filter((s) => s.is_visible)
				.map((s) => s.url)
		: [];
	const ubicaciones = visibles.has('ubicacion')
		? ordenar(tarjeta.ubicaciones).filter((u) => u.is_visible)
		: [];
	const [principal, ...otras] = ubicaciones;

	const persona: Record<string, unknown> = {
		'@type': 'Person',
		'@id': personaId,
		name: nombreCompleto(tarjeta),
		givenName: tarjeta.nombres,
		...(tarjeta.apellidos && { familyName: tarjeta.apellidos }),
		...(tarjeta.prefijo && { honorificPrefix: tarjeta.prefijo }),
		jobTitle: tarjeta.cargo ?? tarjeta.rubro,
		knowsAbout: tarjeta.rubro,
		url,
		...(imagen(tarjeta.profile_url) && { image: imagen(tarjeta.profile_url) }),
		...(tarjeta.acerca_de_mi && visibles.has('acerca') && { description: tarjeta.acerca_de_mi }),
		...(telefono && { telephone: `+${numeroInternacional(telefono.valor)}` }),
		...(correo && { email: correo.valor }),
		...([...redes, ...sitios].length > 0 && { sameAs: [...redes, ...sitios] }),
		worksFor: { '@id': negocioId }
	};

	if (visibles.has('educacion')) {
		const estudios = ordenar(tarjeta.educacion).filter((e) => e.is_visible);
		if (estudios.length > 0) {
			persona.alumniOf = estudios.map((e) => ({
				'@type': 'EducationalOrganization',
				name: e.institucion
			}));
		}
	}
	if (visibles.has('certificaciones')) {
		const credenciales = ordenar(tarjeta.certificaciones).filter((c) => c.is_visible);
		if (credenciales.length > 0) {
			persona.hasCredential = credenciales.map((c) => ({
				'@type': 'EducationalOccupationalCredential',
				name: c.nombre,
				credentialCategory: 'certificate',
				...(c.entidad_emisora && {
					recognizedBy: { '@type': 'Organization', name: c.entidad_emisora }
				}),
				...(c.url_credencial && { url: c.url_credencial }),
				...(c.fecha_emision && { dateCreated: c.fecha_emision }),
				...(c.fecha_expiracion && { expires: c.fecha_expiracion })
			}));
		}
	}

	const negocio: Record<string, unknown> = {
		'@type': schemaDeRubro(tarjeta.rubro),
		'@id': negocioId,
		name: tarjeta.nombre_empresa ?? nombreCompleto(tarjeta),
		url,
		image: imagenSeoTarjeta(tarjeta),
		...(imagen(tarjeta.logo_empresa_url) && { logo: imagen(tarjeta.logo_empresa_url) }),
		...(telefono && { telephone: `+${numeroInternacional(telefono.valor)}` }),
		...(correo && { email: correo.valor }),
		...(redes.length > 0 && { sameAs: redes }),
		founder: { '@id': personaId }
	};

	if (principal) {
		negocio.address = direccion(principal);
		const geo = coordenadas(principal);
		if (geo) negocio.geo = geo;
		if (principal.horarios.length > 0) negocio.openingHoursSpecification = horarios(principal);
		if (principal.ciudad) negocio.areaServed = principal.ciudad;
		if (otras.length > 0) {
			negocio.location = ubicaciones.map((u) => ({
				'@type': 'Place',
				name: u.nombre ?? u.direccion,
				address: direccion(u),
				...(coordenadas(u) && { geo: coordenadas(u) }),
				...(u.horarios.length > 0 && { openingHoursSpecification: horarios(u) })
			}));
		}
	}

	if (visibles.has('vitrina')) {
		const seccion = tarjeta.secciones.find((s) => s.clave === 'vitrina');
		const items = ordenar(tarjeta.vitrina.items).filter((i) => i.is_visible);
		if (items.length > 0) {
			negocio.hasOfferCatalog = {
				'@type': 'OfferCatalog',
				name: seccion ? tituloSeccion(seccion) : 'Servicios',
				itemListElement: items.map((item) => ({
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Service',
						name: item.titulo,
						...(item.descripcion && { description: item.descripcion }),
						...(imagen(item.imagenes[0]?.url ?? null) && {
							image: imagen(item.imagenes[0]?.url ?? null)
						})
					},
					...(tarjeta.vitrina.mostrar_precios &&
						item.precio !== null && { price: item.precio, priceCurrency: tarjeta.vitrina.moneda })
				}))
			};
		}
	}

	const grafo: Record<string, unknown>[] = [persona, negocio];

	if (visibles.has('faq')) {
		const preguntas = ordenar(tarjeta.faq).filter((f) => f.is_visible);
		if (preguntas.length > 0) {
			grafo.push({
				'@type': 'FAQPage',
				'@id': `${url}#preguntas`,
				mainEntity: preguntas.map((f) => ({
					'@type': 'Question',
					name: f.pregunta,
					acceptedAnswer: { '@type': 'Answer', text: f.respuesta }
				}))
			});
		}
	}

	return { '@context': 'https://schema.org', '@graph': grafo };
}
