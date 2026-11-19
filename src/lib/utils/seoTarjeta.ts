import { APP_SITE_CONFIG } from '#lib/constants/assets.ts';
import type { TarjetaPublica } from '#lib/interfaces/index.ts';
import { nombreCompleto } from './tarjeta';
import { urlAbsoluta } from './urlPublica';

/** Título, descripción e imagen de una tarjeta para buscadores y redes (lo vacío se genera) */

type DatosSeo = Pick<
	TarjetaPublica,
	| 'prefijo'
	| 'nombres'
	| 'apellidos'
	| 'cargo'
	| 'rubro'
	| 'nombre_empresa'
	| 'acerca_de_mi'
	| 'profile_url'
	| 'seo'
	| 'ubicaciones'
>;

function recortar(texto: string, maximo: number): string {
	if (texto.length <= maximo) return texto;
	const corte = texto.slice(0, maximo - 1);
	return `${corte.slice(0, Math.max(corte.lastIndexOf(' '), maximo - 20)).trimEnd()}…`;
}

function ciudadPrincipal(tarjeta: DatosSeo): string | null {
	return tarjeta.ubicaciones.find((u) => u.ciudad)?.ciudad ?? null;
}

/** ≤ 70 caracteres: "Dra. Fabiola Mendoza | Pediatra en Santa Cruz" */
export function tituloSeoTarjeta(tarjeta: DatosSeo): string {
	if (tarjeta.seo.meta_title) return tarjeta.seo.meta_title;
	const ciudad = ciudadPrincipal(tarjeta);
	const detalle = `${tarjeta.cargo ?? tarjeta.rubro}${ciudad ? ` en ${ciudad}` : ''}`;
	return recortar(`${nombreCompleto(tarjeta)} | ${detalle}`, 70);
}

/** ≤ 160 caracteres: profesión, empresa, ciudad y el inicio de "acerca de mí" */
export function descripcionSeoTarjeta(tarjeta: DatosSeo): string {
	if (tarjeta.seo.meta_description) return tarjeta.seo.meta_description;
	const ciudad = ciudadPrincipal(tarjeta);
	const quien = [
		tarjeta.cargo ?? tarjeta.rubro,
		tarjeta.nombre_empresa ? `en ${tarjeta.nombre_empresa}` : null,
		ciudad ? `(${ciudad})` : null
	]
		.filter(Boolean)
		.join(' ');
	const acerca = tarjeta.acerca_de_mi?.replace(/\s+/g, ' ').trim();
	return recortar(`${nombreCompleto(tarjeta)}, ${quien}.${acerca ? ` ${acerca}` : ''}`, 160);
}

/** Imagen para compartir (absoluta). Las data: de los datos de prueba no sirven a las redes */
export function imagenSeoTarjeta(tarjeta: DatosSeo): string {
	const imagen = [tarjeta.seo.og_image_url, tarjeta.profile_url].find(
		(url): url is string => !!url && !url.startsWith('data:')
	);
	return urlAbsoluta(imagen ?? APP_SITE_CONFIG.DEFAULT_OG_IMAGE);
}
