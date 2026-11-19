import { describe, expect, it } from 'vitest';
import { tarjetaDePrueba } from '#lib/components/features/tarjeta/tarjetaDePrueba.ts';
import { fotoDeContacto, generarVCard, nombreArchivoVcf } from './vcard.ts';

const URL_TARJETA = 'https://me.svelpy.com/doctora-prueba';

describe('generarVCard', () => {
	it('arma una vCard 3.0 con nombre, cargo, teléfono y la dirección de la tarjeta', () => {
		const vcf = generarVCard(tarjetaDePrueba(), URL_TARJETA);
		const lineas = vcf.split('\r\n');
		expect(lineas.slice(0, 2)).toEqual(['BEGIN:VCARD', 'VERSION:3.0']);
		expect(lineas).toContain('N:Prueba;Lucía;;Dra.;');
		expect(lineas).toContain('FN:Dra. Lucía Prueba');
		expect(lineas).toContain('TITLE:Pediatra');
		expect(lineas).toContain('TEL;TYPE=CELL,VOICE,PREF:+59170000000');
		expect(lineas).toContain(`URL:${URL_TARJETA}`);
		expect(vcf.endsWith('END:VCARD\r\n')).toBe(true);
	});

	it('escapa comas, punto y coma y saltos de línea', () => {
		const vcf = generarVCard(
			tarjetaDePrueba({ acerca_de_mi: 'Niños, adolescentes; y familias.\nCon cita.' }),
			URL_TARJETA
		);
		expect(vcf).toContain('NOTE:Niños\\, adolescentes\\; y familias.\\nCon cita.');
	});

	it('pliega las líneas largas a 75 caracteres', () => {
		const vcf = generarVCard(
			tarjetaDePrueba({ acerca_de_mi: 'Consultas. '.repeat(30) }),
			URL_TARJETA
		);
		const lineas = vcf.split('\r\n');
		for (const linea of lineas) expect(linea.length).toBeLessThanOrEqual(75);
		// Las líneas de continuación empiezan con un espacio y, unidas, devuelven la nota entera
		const nota = lineas.findIndex((linea) => linea.startsWith('NOTE:'));
		const continuacion = lineas.slice(nota + 1).filter((linea) => linea.startsWith(' '));
		expect(continuacion.length).toBeGreaterThan(0);
		const unida = [lineas[nota], ...continuacion.map((linea) => linea.slice(1))].join('');
		expect(unida).toBe(`NOTE:${'Consultas. '.repeat(30)}`);
	});

	it('incluye la foto: embebida si se descargó, o como enlace', () => {
		const conEnlace = generarVCard(
			tarjetaDePrueba({ profile_url: 'https://fotos.test/perfil.jpg' }),
			URL_TARJETA
		);
		expect(conEnlace).toContain('PHOTO;VALUE=URI:https://fotos.test/perfil.jpg');

		const embebida = generarVCard(tarjetaDePrueba(), URL_TARJETA, {
			tipo: 'PNG',
			base64: 'iVBORw0KGgo'
		});
		expect(embebida).toContain('PHOTO;ENCODING=b;TYPE=PNG:iVBORw0KGgo');
	});
});

describe('fotoDeContacto', () => {
	it('prefiere la foto para la agenda y, si falta, usa la de perfil', () => {
		expect(
			fotoDeContacto({
				photo_usuario_url: 'https://a.test/agenda.jpg',
				profile_url: 'https://a.test/perfil.jpg'
			})
		).toBe('https://a.test/agenda.jpg');
		expect(
			fotoDeContacto({ photo_usuario_url: null, profile_url: 'https://a.test/perfil.jpg' })
		).toBe('https://a.test/perfil.jpg');
		expect(fotoDeContacto({ photo_usuario_url: null, profile_url: null })).toBeNull();
	});
});

describe('nombreArchivoVcf', () => {
	it('usa la dirección de la tarjeta', () => {
		expect(nombreArchivoVcf({ slug: 'doctora-prueba' })).toBe('doctora-prueba.vcf');
	});
});
