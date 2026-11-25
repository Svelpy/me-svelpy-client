import { schemaDeRubro } from '#lib/config/rubros.config.ts';
import type { TarjetaPublica, TarjetaUbicacionPublica } from '#lib/interfaces/index.ts';
import { numeroInternacional, websiteUrl } from './contacto';
import { horaCorta } from './horarios';
import { imagenSeoTarjeta } from './seoTarjeta';
import {
	contactoPrincipal,
	contactosDeTipo,
	nombreCompleto,
	numeroDe,
	tituloSeccion
} from './tarjeta';

/**
 * Datos estructurados (JSON-LD, Schema.org) de una tarjeta pública: lo que leen Google y las IAs
 * (GEO). Un @graph con la persona, su negocio (con el tipo de su rubro, direcciones, horarios y
 * catálogo) y sus preguntas frecuentes. La tarjeta pública ya trae solo lo visible, en su orden.
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

function direccion(ubicacion: TarjetaUbicacionPublica) {
	return {
		'@type': 'PostalAddress',
		streetAddress: ubicacion.direccion,
		...(ubicacion.ciudad && { addressLocality: ubicacion.ciudad }),
		...(ubicacion.departamento && { addressRegion: ubicacion.departamento }),
		...(ubicacion.pais && { addressCountry: ubicacion.pais })
	};
}

function coordenadas(ubicacion: TarjetaUbicacionPublica) {
	const latitude = numeroDe(ubicacion.lat);
	const longitude = numeroDe(ubicacion.lng);
	return latitude !== null && longitude !== null
		? { '@type': 'GeoCoordinates', latitude, longitude }
		: undefined;
}

function horarios(ubicacion: TarjetaUbicacionPublica) {
	return ubicacion.horarios.map((franja) => ({
		'@type': 'OpeningHoursSpecification',
		dayOfWeek: `https://schema.org/${DIAS_SCHEMA[franja.dia_semana]}`,
		opens: horaCorta(franja.hora_inicio),
		closes: horaCorta(franja.hora_fin)
	}));
}

/** Imagen absoluta o nada */
function imagen(url: string | null): string | undefined {
	return url && /^https?:/i.test(url) ? url : undefined;
}

export function construirJsonLd(tarjeta: TarjetaPublica, url: string): Record<string, unknown> {
	const visibles = new Set(tarjeta.secciones.map((s) => s.clave));
	const personaId = `${url}#persona`;
	const negocioId = `${url}#negocio`;

	const telefono = contactoPrincipal(tarjeta.contactos, 'phone');
	const correo = contactoPrincipal(tarjeta.contactos, 'email');
	const sitios = contactosDeTipo(tarjeta.contactos, 'website').map((s) => websiteUrl(s.valor));
	const redes = visibles.has('redes') ? tarjeta.redes.map((r) => r.url) : [];
	const ubicaciones = visibles.has('ubicacion') ? tarjeta.ubicaciones : [];
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
		const estudios = tarjeta.educaciones;
		if (estudios.length > 0) {
			persona.alumniOf = estudios.map((e) => ({
				'@type': 'EducationalOrganization',
				name: e.institucion
			}));
		}
	}
	if (visibles.has('certificaciones')) {
		const credenciales = tarjeta.certificaciones;
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
		const items = tarjeta.vitrina.items;
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
						numeroDe(item.precio) !== null && {
							price: numeroDe(item.precio),
							priceCurrency: tarjeta.vitrina.moneda
						})
				}))
			};
		}
	}

	const grafo: Record<string, unknown>[] = [persona, negocio];

	if (visibles.has('faq')) {
		const preguntas = tarjeta.faqs;
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
