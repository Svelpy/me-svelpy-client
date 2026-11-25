/**
 * API de prueba para las E2E, solo con las rutas públicas de la tarjeta. El perfil (`/[slug]`) y el
 * QR (`/t/[id]`) se arman en el servidor, y esa petición sale de Node: `page.route()` no la ve. El
 * build de las E2E apunta aquí (`VITE_API_ENDPOINT`); lo que pide el navegador lo responde cada
 * test con `page.route()` (`src/routes/e2e.api.ts`).
 *
 * Los datos son los ejemplos del OpenAPI (`tests/fixtures/api.ejemplos.json`).
 */
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

const PUERTO = Number(process.env.PUERTO_API_PRUEBA ?? 4010);
const ejemplos = JSON.parse(
	readFileSync(new URL('./fixtures/api.ejemplos.json', import.meta.url), 'utf8')
);
const tarjeta = ejemplos.TarjetaPublic;

const noExiste = {
	status: 'fail',
	code: 'RESOURCE_NOT_FOUND',
	message: 'La tarjeta no existe o no está publicada.'
};

function responder(res, status, cuerpo) {
	res.writeHead(status, {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*'
	});
	res.end(JSON.stringify(cuerpo));
}

createServer((req, res) => {
	const { pathname } = new URL(req.url ?? '/', `http://localhost:${PUERTO}`);
	if (req.method === 'GET' && pathname === '/salud') return responder(res, 200, { ok: true });

	const porId = pathname.match(/^\/api\/v1\/tarjetas\/public\/id\/([^/]+)$/);
	if (req.method === 'GET' && porId) {
		return porId[1] === tarjeta.id ? responder(res, 200, tarjeta) : responder(res, 404, noExiste);
	}
	const porSlug = pathname.match(/^\/api\/v1\/tarjetas\/public\/([^/]+)$/);
	if (req.method === 'GET' && porSlug && porSlug[1] !== 'slug-disponible') {
		return decodeURIComponent(porSlug[1]) === tarjeta.slug
			? responder(res, 200, tarjeta)
			: responder(res, 404, noExiste);
	}
	responder(res, 404, { status: 'fail', code: 'RESOURCE_NOT_FOUND', message: 'Ruta de prueba.' });
}).listen(PUERTO);
