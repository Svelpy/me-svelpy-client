import { describe, expect, it } from 'vitest';
import {
	comoLlegarUrl,
	detectarRedSocial,
	hrefContacto,
	mapsUrl,
	numeroInternacional,
	telUrl,
	urlSinProtocolo,
	usuarioDesdeUrl,
	whatsappUrl
} from './contacto.ts';

const ubicacion = {
	maps_url: null,
	lat: null,
	lng: null,
	direccion: 'Calle Las Palmeras 245',
	ciudad: 'Santa Cruz de la Sierra',
	departamento: 'Santa Cruz',
	pais: 'Bolivia'
};

describe('numeroInternacional', () => {
	it('a los números de Bolivia sin código les agrega el 591', () => {
		expect(numeroInternacional('7001 2345')).toBe('59170012345');
		expect(numeroInternacional('3 3412345')).toBe('59133412345');
	});

	it('respeta los que ya traen el código del país', () => {
		expect(numeroInternacional('+591 700-12345')).toBe('59170012345');
		expect(numeroInternacional('59170012345')).toBe('59170012345');
		expect(numeroInternacional('+1 (555) 010-9999')).toBe('15550109999');
		expect(numeroInternacional('0034 600 000 000')).toBe('34600000000');
	});
});

describe('enlaces de contacto', () => {
	it('WhatsApp con el mensaje codificado', () => {
		expect(whatsappUrl('70012345', 'Hola, quiero una cita')).toBe(
			'https://wa.me/59170012345?text=Hola%2C%20quiero%20una%20cita'
		);
		expect(whatsappUrl('70012345')).toBe('https://wa.me/59170012345');
	});

	it('cada tipo de contacto abre lo que corresponde', () => {
		expect(telUrl('3 3412345')).toBe('tel:+59133412345');
		expect(hrefContacto({ tipo: 'email', valor: 'citas@consultorio.bo' })).toBe(
			'mailto:citas@consultorio.bo'
		);
		expect(hrefContacto({ tipo: 'website', valor: 'www.consultorio.bo' })).toBe(
			'https://www.consultorio.bo'
		);
		expect(hrefContacto({ tipo: 'website', valor: 'http://consultorio.bo' })).toBe(
			'http://consultorio.bo'
		);
	});

	it('muestra los sitios sin protocolo, sin www ni barra final', () => {
		expect(urlSinProtocolo('https://www.pediatriacrecer.bo/')).toBe('pediatriacrecer.bo');
	});
});

describe('mapas', () => {
	it('usa la ficha de Google si el profesional la pegó', () => {
		const ficha = 'https://maps.app.goo.gl/abc123';
		expect(mapsUrl({ ...ubicacion, maps_url: ficha })).toBe(ficha);
	});

	it('si no, busca por coordenadas o por la dirección completa', () => {
		expect(mapsUrl({ ...ubicacion, lat: '-17.78', lng: '-63.18' })).toBe(
			'https://www.google.com/maps/search/?api=1&query=-17.78%2C-63.18'
		);
		expect(comoLlegarUrl(ubicacion)).toBe(
			`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
				'Calle Las Palmeras 245, Santa Cruz de la Sierra, Santa Cruz, Bolivia'
			)}`
		);
	});
});

describe('redes sociales', () => {
	it('reconoce la red por el dominio del enlace', () => {
		expect(detectarRedSocial('instagram.com/dra.fabiola')).toBe('instagram');
		expect(detectarRedSocial('https://youtu.be/abc')).toBe('youtube');
		expect(detectarRedSocial('https://twitter.com/me')).toBe('x');
		expect(detectarRedSocial('https://www.doctoralia.com.bo/fabiola')).toBe('doctoralia');
		expect(detectarRedSocial('https://consultorio.bo')).toBeNull();
		expect(detectarRedSocial('esto no es un enlace')).toBeNull();
	});

	it('saca el usuario del enlace', () => {
		expect(usuarioDesdeUrl('https://instagram.com/dra.fabiola/')).toBe('dra.fabiola');
		expect(usuarioDesdeUrl('https://www.tiktok.com/@chef.rodrigo')).toBe('chef.rodrigo');
		expect(usuarioDesdeUrl('https://www.linkedin.com/in/fabiola-mendoza')).toBe('fabiola-mendoza');
		expect(usuarioDesdeUrl('https://consultorio.bo')).toBeNull();
	});
});
