import { RED_SOCIAL_LABEL } from '#lib/constants/data.ts';
import type { TarjetaPublica } from '#lib/interfaces/index.ts';
import { numeroInternacional, websiteUrl } from './contacto';
import { contactosDeTipo, nombreCompleto } from './tarjeta';

/** Contacto .vcf (vCard 3.0) para "Guardar contacto": se guarda en la agenda del teléfono */

type DatosVCard = Pick<
	TarjetaPublica,
	| 'slug'
	| 'prefijo'
	| 'nombres'
	| 'apellidos'
	| 'cargo'
	| 'nombre_empresa'
	| 'acerca_de_mi'
	| 'profile_url'
	| 'photo_usuario_url'
	| 'contactos'
	| 'ubicaciones'
	| 'redes'
>;

export interface FotoVCard {
	tipo: 'JPEG' | 'PNG' | 'WEBP' | 'GIF';
	base64: string;
}

/** Escapa los caracteres especiales de un valor vCard */
function escapar(valor: string): string {
	return valor
		.replace(/\\/g, '\\\\')
		.replace(/\r?\n/g, '\\n')
		.replace(/,/g, '\\,')
		.replace(/;/g, '\\;');
}

/** Pliega las líneas a 75 caracteres (RFC 2425): las siguientes empiezan con un espacio */
function plegar(linea: string): string {
	if (linea.length <= 75) return linea;
	const partes = [linea.slice(0, 75)];
	for (let i = 75; i < linea.length; i += 74) partes.push(` ${linea.slice(i, i + 74)}`);
	return partes.join('\r\n');
}

/** Foto que se guarda con el contacto: la de la agenda o, si falta, la de perfil */
export function fotoDeContacto(
	tarjeta: Pick<DatosVCard, 'photo_usuario_url' | 'profile_url'>
): string | null {
	return tarjeta.photo_usuario_url ?? tarjeta.profile_url ?? null;
}

export function generarVCard(
	tarjeta: DatosVCard,
	urlPublica: string,
	foto?: FotoVCard | null
): string {
	const lineas = ['BEGIN:VCARD', 'VERSION:3.0'];
	lineas.push(
		`N:${escapar(tarjeta.apellidos ?? '')};${escapar(tarjeta.nombres)};;${escapar(tarjeta.prefijo ?? '')};`
	);
	lineas.push(`FN:${escapar(nombreCompleto(tarjeta))}`);
	if (tarjeta.nombre_empresa) lineas.push(`ORG:${escapar(tarjeta.nombre_empresa)}`);
	if (tarjeta.cargo) lineas.push(`TITLE:${escapar(tarjeta.cargo)}`);

	contactosDeTipo(tarjeta.contactos, 'phone').forEach((telefono, indice) => {
		const tipos = ['CELL', 'VOICE', ...(indice === 0 ? ['PREF'] : [])].join(',');
		lineas.push(`TEL;TYPE=${tipos}:+${numeroInternacional(telefono.valor)}`);
	});
	contactosDeTipo(tarjeta.contactos, 'email').forEach((correo, indice) => {
		lineas.push(`EMAIL;TYPE=INTERNET${indice === 0 ? ',PREF' : ''}:${correo.valor}`);
	});

	lineas.push(`URL:${urlPublica}`);
	contactosDeTipo(tarjeta.contactos, 'website').forEach((sitio) => {
		lineas.push(`URL:${websiteUrl(sitio.valor)}`);
	});

	// La tarjeta pública ya viene con lo visible y en orden
	const [ubicacion] = tarjeta.ubicaciones;
	if (ubicacion) {
		const adr = [
			'',
			'',
			ubicacion.direccion,
			ubicacion.ciudad ?? '',
			ubicacion.departamento ?? '',
			'',
			ubicacion.pais ?? ''
		]
			.map(escapar)
			.join(';');
		lineas.push(`ADR;TYPE=WORK:${adr}`);
	}

	if (tarjeta.acerca_de_mi) {
		const nota =
			tarjeta.acerca_de_mi.length > 400
				? `${tarjeta.acerca_de_mi.slice(0, 399)}…`
				: tarjeta.acerca_de_mi;
		lineas.push(`NOTE:${escapar(nota)}`);
	}

	for (const red of tarjeta.redes) {
		lineas.push(`X-SOCIALPROFILE;TYPE=${RED_SOCIAL_LABEL[red.red].toLowerCase()}:${red.url}`);
	}

	const urlFoto = fotoDeContacto(tarjeta);
	if (foto) {
		lineas.push(`PHOTO;ENCODING=b;TYPE=${foto.tipo}:${foto.base64}`);
	} else if (urlFoto && /^https?:/i.test(urlFoto)) {
		lineas.push(`PHOTO;VALUE=URI:${urlFoto}`);
	}

	lineas.push('END:VCARD');
	return lineas.map(plegar).join('\r\n') + '\r\n';
}

export function nombreArchivoVcf(tarjeta: Pick<DatosVCard, 'slug'>): string {
	return `${tarjeta.slug}.vcf`;
}

/**
 * Descarga la foto y la devuelve en base64 para incrustarla (iOS ignora las fotos por URL).
 * null si no se puede (CORS, red); entonces el .vcf lleva la foto por URL.
 */
export async function fotoParaVCard(url: string | null): Promise<FotoVCard | null> {
	if (!url) return null;
	try {
		const data = url.startsWith('data:')
			? url
			: await blobADataUrl(await (await fetch(url)).blob());
		const match = /^data:image\/(jpe?g|png|webp|gif);base64,(.+)$/i.exec(data);
		if (!match) return null;
		const tipo = match[1].toUpperCase().replace('JPG', 'JPEG') as FotoVCard['tipo'];
		return { tipo, base64: match[2] };
	} catch {
		return null;
	}
}

function blobADataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const lector = new FileReader();
		lector.onload = () => resolve(String(lector.result));
		lector.onerror = () => reject(lector.error);
		lector.readAsDataURL(blob);
	});
}
