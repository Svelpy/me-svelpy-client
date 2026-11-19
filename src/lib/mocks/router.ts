import { authRutas } from './auth.mock';
import type { Metodo, RutaMock } from './db/contexto';
import { tarjetaRutas } from './modelos/tarjeta.mock';
import { certificacionRutas } from './modelos/tarjetaCertificacion.mock';
import { contactoRutas } from './modelos/tarjetaContacto.mock';
import { educacionRutas } from './modelos/tarjetaEducacion.mock';
import { faqRutas } from './modelos/tarjetaFaq.mock';
import { seccionRutas } from './modelos/tarjetaSeccion.mock';
import { seoRutas } from './modelos/tarjetaSeo.mock';
import { socialRutas } from './modelos/tarjetaSocial.mock';
import { temaRutas } from './modelos/tarjetaTheme.mock';
import { ubicacionRutas } from './modelos/tarjetaUbicacion.mock';
import { horarioRutas } from './modelos/ubicacionHorario.mock';
import { usuarioRutas } from './modelos/usuario.mock';
import { vitrinaRutas } from './modelos/vitrina.mock';
import { categoriaRutas } from './modelos/vitrinaCategoria.mock';
import { itemRutas } from './modelos/vitrinaItem.mock';
import { imagenRutas } from './modelos/vitrinaItemImagen.mock';
import { resumenRutas } from './resumen.mock';
import { uploadRutas } from './upload.mock';

/** Tabla de rutas del backend simulado: método + patrón → manejador */

interface RutaCompilada {
	ruta: RutaMock;
	regex: RegExp;
	nombres: string[];
}

function compilar(ruta: RutaMock): RutaCompilada {
	const nombres: string[] = [];
	const fuente = ruta.patron
		.split('/')
		.map((segmento) => {
			if (!segmento.startsWith(':')) return segmento;
			nombres.push(segmento.slice(1));
			return '([^/]+)';
		})
		.join('/');
	return { ruta, regex: new RegExp(`^${fuente}/?$`), nombres };
}

// Las rutas con menos parámetros van primero: '/tarjetas/mia' gana a '/tarjetas/:id'
const RUTAS: RutaCompilada[] = [
	...authRutas,
	...usuarioRutas,
	...tarjetaRutas,
	...temaRutas,
	...seoRutas,
	...seccionRutas,
	...contactoRutas,
	...ubicacionRutas,
	...horarioRutas,
	...socialRutas,
	...vitrinaRutas,
	...categoriaRutas,
	...itemRutas,
	...imagenRutas,
	...educacionRutas,
	...certificacionRutas,
	...faqRutas,
	...resumenRutas,
	...uploadRutas
]
	.map(compilar)
	.sort((a, b) => a.nombres.length - b.nombres.length);

export function buscarRuta(
	metodo: Metodo,
	ruta: string
): { ruta: RutaMock; params: Record<string, string> } | null {
	for (const compilada of RUTAS) {
		if (compilada.ruta.metodo !== metodo) continue;
		const match = compilada.regex.exec(ruta);
		if (!match) continue;
		const params = Object.fromEntries(
			compilada.nombres.map((nombre, indice) => [nombre, decodeURIComponent(match[indice + 1])])
		);
		return { ruta: compilada.ruta, params };
	}
	return null;
}
