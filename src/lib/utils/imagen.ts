import { ErrorCode, type ImagenTipo } from '#lib/interfaces/index.ts';
import { AppError } from '#lib/services/error.service.ts';

/**
 * Antes de subir una imagen (`POST /imagenes/uploads`, máximo 5 MB y sin SVG) se achica en el
 * navegador según su uso: sube más rápido con datos móviles y nunca choca con el límite.
 */

/** Lado más largo, en píxeles, según dónde se muestra */
export const LADO_MAXIMO: Record<ImagenTipo, number> = {
	perfil: 640,
	agenda: 400,
	portada: 1280,
	logo: 400,
	qr_pago: 640,
	vitrina: 960,
	og: 1200,
	comprobante: 1600
};

/** Peso máximo que acepta la API */
export const PESO_MAXIMO_IMAGEN = 5 * 1024 * 1024;

/** Logos y QR en WebP para conservar la transparencia; las fotos en JPEG */
const CON_TRANSPARENCIA: readonly ImagenTipo[] = ['logo', 'qr_pago'];

/** Formatos que se pueden elegir (para el `accept` de los inputs) */
export const FORMATOS_IMAGEN = 'image/jpeg,image/png,image/webp';

function errorDeImagen(mensaje: string): AppError {
	return new AppError({
		message: mensaje,
		code: ErrorCode.VALIDATION_ERROR,
		status: 422,
		details: { file: mensaje }
	});
}

/** Rechaza lo que la API no acepta, antes de procesarlo */
export function validarImagen(archivo: Blob): void {
	if (!archivo.type.startsWith('image/')) {
		throw errorDeImagen('El archivo debe ser una imagen (JPG, PNG o WebP).');
	}
	if (archivo.type === 'image/svg+xml') {
		throw errorDeImagen('Las imágenes SVG no se aceptan. Usa JPG, PNG o WebP.');
	}
}

/** Nombre del archivo con la extensión del formato final */
function nombreFinal(nombre: string, tipoMime: string): string {
	const base = nombre.replace(/\.[^.]+$/, '') || 'imagen';
	return `${base}.${tipoMime === 'image/webp' ? 'webp' : 'jpg'}`;
}

/** Medidas finales para que el lado más largo no pase de `ladoMaximo` (nunca agranda) */
export function medidasAjustadas(
	ancho: number,
	alto: number,
	ladoMaximo: number
): { ancho: number; alto: number } {
	const escala = Math.min(1, ladoMaximo / Math.max(ancho, alto));
	return {
		ancho: Math.max(1, Math.round(ancho * escala)),
		alto: Math.max(1, Math.round(alto * escala))
	};
}

/** La imagen lista para subir: validada, achicada y en JPEG o WebP */
export async function prepararImagen(archivo: File, tipo: ImagenTipo): Promise<File> {
	validarImagen(archivo);

	let resultado: Blob = archivo;
	if (typeof createImageBitmap !== 'undefined' && typeof document !== 'undefined') {
		let imagen: ImageBitmap;
		try {
			imagen = await createImageBitmap(archivo);
		} catch {
			throw errorDeImagen('No se pudo leer la imagen. Prueba con otra en JPG o PNG.');
		}
		const { ancho, alto } = medidasAjustadas(imagen.width, imagen.height, LADO_MAXIMO[tipo]);
		const lienzo = document.createElement('canvas');
		lienzo.width = ancho;
		lienzo.height = alto;
		lienzo.getContext('2d')?.drawImage(imagen, 0, 0, ancho, alto);
		imagen.close();

		const formato = CON_TRANSPARENCIA.includes(tipo) ? 'image/webp' : 'image/jpeg';
		const calidad = formato === 'image/webp' ? 0.9 : 0.82;
		const comprimida = await new Promise<Blob | null>((resolve) =>
			lienzo.toBlob(resolve, formato, calidad)
		);
		if (comprimida) resultado = comprimida;
	}

	if (resultado.size > PESO_MAXIMO_IMAGEN) {
		throw errorDeImagen('La imagen pesa más de 5 MB. Elige una más liviana.');
	}
	return resultado === archivo
		? archivo
		: new File([resultado], nombreFinal(archivo.name, resultado.type), { type: resultado.type });
}
