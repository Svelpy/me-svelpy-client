// Genera los íconos rasterizados del sitio a partir del isotipo de ME (mismo trazo que src/lib/assets/favicon.svg):
//   - static/favicon.ico          → 16, 32 y 48 px (pestañas antiguas, buscadores y crawlers que piden /favicon.ico)
//   - static/icon-192.png         → ícono PNG que Google y Android usan para el sitio
//   - static/apple-touch-icon.png → 180 px, para "Agregar a inicio" en iOS
//
// Uso: pnpm landing:iconos   (requiere Chromium de Playwright)
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STATIC = join(ROOT, 'static');

const CIRUELA = '#2a182d';
const NARANJA = '#ff4724';
const BLANCO = '#ffffff';

// Isotipo "ME" centrado en (540, 540). Versión para fondo oscuro: blanco + naranja.
const GLIFO = `
	<rect fill="${BLANCO}" x="147.52" y="311.27" width="83.18" height="457.46" rx="41.59" />
	<rect fill="${BLANCO}" x="428.23" y="311.27" width="83.18" height="457.46" rx="41.59" />
	<rect fill="${NARANJA}" x="287.88" y="401.38" width="83.18" height="180.21" rx="41.59" />
	<rect fill="${BLANCO}" x="568.59" y="311.27" width="363.89" height="83.18" rx="41.59" />
	<rect fill="${NARANJA}" x="568.59" y="498.41" width="363.89" height="83.18" rx="41.59" />
	<rect fill="${BLANCO}" x="568.59" y="685.55" width="363.89" height="83.18" rx="41.59" />`;

/**
 * @param {number} mitad   media anchura del lienzo alrededor del centro (más grande = más margen)
 * @param {number} radio   radio de las esquinas del fondo, como fracción del lado (0 = cuadrado)
 */
function svgIcono(mitad, radio) {
	const lado = mitad * 2;
	const min = 540 - mitad;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${min} ${min} ${lado} ${lado}">
	<rect fill="${CIRUELA}" x="${min}" y="${min}" width="${lado}" height="${lado}" rx="${lado * radio}" />
	${GLIFO}
</svg>`;
}

// Favicon: poco margen para que se lea a 16 px, esquinas redondeadas.
const SVG_FAVICON = svgIcono(480, 0.22);
// iOS e íconos de app: más margen, fondo cuadrado (el sistema aplica su propia máscara).
const SVG_APP = svgIcono(560, 0);

const browser = await chromium.launch();
const page = await browser.newPage();

/** @param {string} svg @param {number} size */
async function png(svg, size) {
	await page.setViewportSize({ width: size, height: size });
	await page.setContent(
		`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`
	);
	return page.screenshot({ omitBackground: true, type: 'png' });
}

/** Empaqueta PNGs en un .ico (formato con PNG embebido, soportado desde Windows Vista). */
function ico(imagenes) {
	const cabecera = Buffer.alloc(6);
	cabecera.writeUInt16LE(0, 0);
	cabecera.writeUInt16LE(1, 2);
	cabecera.writeUInt16LE(imagenes.length, 4);
	let offset = 6 + 16 * imagenes.length;
	const entradas = imagenes.map(({ size, data }) => {
		const e = Buffer.alloc(16);
		e.writeUInt8(size >= 256 ? 0 : size, 0);
		e.writeUInt8(size >= 256 ? 0 : size, 1);
		e.writeUInt8(0, 2);
		e.writeUInt8(0, 3);
		e.writeUInt16LE(1, 4);
		e.writeUInt16LE(32, 6);
		e.writeUInt32LE(data.length, 8);
		e.writeUInt32LE(offset, 12);
		offset += data.length;
		return e;
	});
	return Buffer.concat([cabecera, ...entradas, ...imagenes.map((i) => i.data)]);
}

const tamañosIco = [16, 32, 48];
const imagenesIco = [];
for (const size of tamañosIco) imagenesIco.push({ size, data: await png(SVG_FAVICON, size) });
writeFileSync(join(STATIC, 'favicon.ico'), ico(imagenesIco));
writeFileSync(join(STATIC, 'icon-192.png'), await png(SVG_APP, 192));
writeFileSync(join(STATIC, 'apple-touch-icon.png'), await png(SVG_APP, 180));

await browser.close();
console.log('Íconos generados en static/: favicon.ico, icon-192.png, apple-touch-icon.png');
