import type { UploadTipo } from '#lib/interfaces/index.ts';
import { error, exigirSesion, type RutaMock } from './db/contexto';

/**
 * `POST /uploads` de prueba: no hay servidor de archivos, así que la imagen se achica en el
 * navegador y se devuelve como data URL (se guarda en localStorage junto con la fila).
 */

const LADO_MAXIMO: Record<UploadTipo, number> = {
	perfil: 640,
	agenda: 400,
	portada: 1280,
	logo: 400,
	qr_pago: 640,
	vitrina: 960,
	og: 1200
};

/** Fotos en JPEG; logos y QR en WebP para conservar la transparencia */
const CON_TRANSPARENCIA: UploadTipo[] = ['logo', 'qr_pago'];

const PESO_MAXIMO = 8 * 1024 * 1024;

function esTipo(valor: unknown): valor is UploadTipo {
	return typeof valor === 'string' && valor in LADO_MAXIMO;
}

function leerComoDataUrl(archivo: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const lector = new FileReader();
		lector.onload = () => resolve(String(lector.result));
		lector.onerror = () => reject(lector.error);
		lector.readAsDataURL(archivo);
	});
}

async function achicar(archivo: Blob, tipo: UploadTipo): Promise<string> {
	if (typeof createImageBitmap === 'undefined' || typeof document === 'undefined') {
		return leerComoDataUrl(archivo);
	}
	const imagen = await createImageBitmap(archivo);
	const escala = Math.min(1, LADO_MAXIMO[tipo] / Math.max(imagen.width, imagen.height));
	const lienzo = document.createElement('canvas');
	lienzo.width = Math.round(imagen.width * escala);
	lienzo.height = Math.round(imagen.height * escala);
	lienzo.getContext('2d')?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
	imagen.close();
	return CON_TRANSPARENCIA.includes(tipo)
		? lienzo.toDataURL('image/webp', 0.9)
		: lienzo.toDataURL('image/jpeg', 0.82);
}

export const uploadRutas: RutaMock[] = [
	{
		metodo: 'POST',
		patron: '/uploads',
		manejar: async (ctx) => {
			exigirSesion(ctx);
			const { archivo, tipo } = (ctx.cuerpo ?? {}) as { archivo?: unknown; tipo?: unknown };
			if (!(archivo instanceof Blob)) throw error.validacion({ archivo: 'Elige una imagen.' });
			if (!archivo.type.startsWith('image/')) {
				throw error.validacion({ archivo: 'El archivo debe ser una imagen (JPG, PNG o WebP).' });
			}
			if (archivo.size > PESO_MAXIMO) {
				throw error.validacion({ archivo: 'La imagen pesa más de 8 MB. Elige una más liviana.' });
			}
			if (!esTipo(tipo)) throw error.validacion({ tipo: 'Tipo de imagen desconocido.' });
			return { url: await achicar(archivo, tipo) };
		}
	}
];
