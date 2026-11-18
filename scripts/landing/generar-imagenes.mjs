// Genera las imágenes simuladas de la landing de ME by Svelpy:
//   - src/lib/assets/landing/perfiles/*.png  → capturas de perfiles (vcards) de ejemplo
//   - src/lib/assets/landing/qr-me-svelpy.svg → QR de la tarjeta física (abre me.svelpy.com)
//   - static/images/landing/og-me-by-svelpy.png → imagen Open Graph 1200x630
//
// Uso: pnpm landing:imagenes   (requiere Chromium de Playwright: pnpm exec playwright install chromium)
//
// Los perfiles son ficticios. Cuando haya clientes reales, reemplaza los PNG por capturas reales
// con el mismo nombre de archivo y deja de ejecutar este script.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import QRCode from 'qrcode';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const fontFile = (pkg, file) =>
	'data:font/woff2;base64,' +
	readFileSync(join(ROOT, 'node_modules/@fontsource-variable', pkg, 'files', file)).toString(
		'base64'
	);

const FONTS = `
@font-face{font-family:'Jakarta';src:url('${fontFile('plus-jakarta-sans', 'plus-jakarta-sans-latin-wght-normal.woff2')}') format('woff2-variations');font-weight:200 800}
@font-face{font-family:'Grotesk';src:url('${fontFile('space-grotesk', 'space-grotesk-latin-wght-normal.woff2')}') format('woff2-variations');font-weight:300 700}
@font-face{font-family:'Mono';src:url('${fontFile('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')}') format('woff2-variations');font-weight:100 800}
`;

// ── Íconos (trazos estilo Tabler)
const icon = (d, size = 20) =>
	`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
	phone:
		'<path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"/>',
	wa: '<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"/><path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1"/>',
	mail: '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z"/><path d="M3 7l9 6l9 -6"/>',
	pin: '<path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/>',
	down: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/><path d="M7 11l5 5l5 -5"/><path d="M12 4l0 12"/>',
	clock: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>',
	cal: '<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/>',
	in: '<path d="M8 11v5"/><path d="M8 8v.01"/><path d="M12 16v-5"/><path d="M16 16v-3a2 2 0 1 0 -4 0"/><path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z"/>'
};

// ── Retrato ilustrado (marcador de foto de perfil)
function avatar({ bg, skin, hair, cloth, style }) {
	const longHair =
		style === 'long'
			? `<path d="M30 46c-2-20 9-31 21-31s22 9 20 31c-1 12 4 22 6 28H25c3-7 6-16 5-28z" fill="${hair}"/>`
			: '';
	const bun = style === 'bun' ? `<circle cx="50" cy="18" r="9" fill="${hair}"/>` : '';
	const cap =
		style === 'short'
			? `<path d="M34 42c-2-15 6-24 16-24s19 8 16 24c-2-7-6-11-16-11s-14 4-16 11z" fill="${hair}"/>`
			: `<path d="M34 44c0-15 7-23 16-23s16 8 16 23c-5-9-10-12-16-12s-12 4-16 12z" fill="${hair}"/>`;
	return `<svg viewBox="0 0 100 100" width="100%" height="100%">
		<rect width="100" height="100" fill="${bg}"/>
		${longHair}${bun}
		<path d="M12 100c3-20 18-29 38-29s35 9 38 29z" fill="${cloth}"/>
		<path d="M42 64h16v10c0 4-4 7-8 7s-8-3-8-7z" fill="${skin}"/>
		<path d="M41 72l9 12l9-12" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" opacity=".9"/>
		<ellipse cx="50" cy="46" rx="15" ry="18" fill="${skin}"/>
		${cap}
	</svg>`;
}

// ── Miniaturas ilustradas del catálogo
const thumb = {
	casa: (c) => `<svg viewBox="0 0 120 120"><rect width="120" height="120" fill="${c.soft}"/>
		<circle cx="96" cy="26" r="10" fill="#fff" opacity=".8"/>
		<rect x="0" y="92" width="120" height="28" fill="${c.ground}"/>
		<circle cx="100" cy="76" r="14" fill="${c.leaf}"/><rect x="98" y="84" width="4" height="12" fill="${c.trunk}"/>
		<polygon points="18,58 52,30 86,58" fill="${c.main}"/>
		<rect x="24" y="56" width="56" height="38" fill="#fff"/>
		<rect x="46" y="70" width="12" height="24" fill="${c.main}"/>
		<rect x="30" y="64" width="11" height="10" fill="${c.glass}"/><rect x="63" y="64" width="11" height="10" fill="${c.glass}"/></svg>`,
	depto: (c) => `<svg viewBox="0 0 120 120"><rect width="120" height="120" fill="${c.soft}"/>
		<rect x="0" y="100" width="120" height="20" fill="${c.ground}"/>
		<rect x="30" y="18" width="44" height="84" fill="#fff"/><rect x="74" y="44" width="26" height="58" fill="${c.main}" opacity=".85"/>
		${[0, 1, 2, 3, 4, 5]
			.map((r) =>
				[0, 1, 2]
					.map(
						(k) =>
							`<rect x="${36 + k * 13}" y="${26 + r * 12}" width="8" height="7" fill="${c.glass}"/>`
					)
					.join('')
			)
			.join('')}</svg>`,
	diente: (c) => `<svg viewBox="0 0 120 120"><rect width="120" height="120" fill="${c.soft}"/>
		<path d="M60 36c8-8 30-8 30 14c0 14-6 22-8 38c-1 8-8 9-10 1l-4-16c-2-6-14-6-16 0l-4 16c-2 8-9 7-10-1c-2-16-8-24-8-38c0-22 22-22 30-14z" fill="#fff" stroke="${c.main}" stroke-width="3"/>
		<path d="M92 26l3 7l7 3l-7 3l-3 7l-3-7l-7-3l7-3z" fill="${c.main}"/></svg>`,
	sonrisa: (c) => `<svg viewBox="0 0 120 120"><rect width="120" height="120" fill="${c.main}"/>
		<path d="M28 56c10 22 54 22 64 0" fill="#fff" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
		<path d="M30 58h60" stroke="${c.main}" stroke-width="2"/>
		${[0, 1, 2, 3, 4].map((k) => `<path d="M${40 + k * 10} 58v8" stroke="${c.soft}" stroke-width="1.5"/>`).join('')}</svg>`,
	camion: (c) => `<svg viewBox="0 0 120 120"><rect width="120" height="120" fill="${c.soft}"/>
		<rect x="0" y="92" width="120" height="28" fill="${c.ground}"/>
		<rect x="14" y="46" width="60" height="38" rx="3" fill="#fff"/><rect x="14" y="46" width="60" height="8" fill="${c.main}"/>
		<path d="M74 58h16l12 14v12H74z" fill="${c.main}"/><rect x="82" y="62" width="9" height="9" fill="${c.glass}"/>
		<circle cx="32" cy="88" r="8" fill="#222"/><circle cx="88" cy="88" r="8" fill="#222"/></svg>`,
	almacen: (c) => `<svg viewBox="0 0 120 120"><rect width="120" height="120" fill="${c.soft}"/>
		<path d="M14 54l46-22l46 22v50H14z" fill="#fff"/><rect x="34" y="66" width="52" height="38" fill="${c.main}"/>
		${[0, 1, 2, 3].map((k) => `<rect x="34" y="${70 + k * 9}" width="52" height="2" fill="${c.soft}" opacity=".6"/>`).join('')}</svg>`,
	contrato: (c) => `<svg viewBox="0 0 120 120"><rect width="120" height="120" fill="${c.soft}"/>
		<rect x="32" y="20" width="56" height="78" rx="4" fill="#fff"/>
		${[0, 1, 2, 3, 4].map((k) => `<rect x="40" y="${32 + k * 9}" width="${k === 4 ? 24 : 40}" height="3" rx="1.5" fill="${c.main}" opacity=".35"/>`).join('')}
		<path d="M42 84c6-8 10 4 16-4s8 6 14 0" fill="none" stroke="${c.main}" stroke-width="2.5" stroke-linecap="round"/>
		<circle cx="82" cy="88" r="12" fill="${c.accent}"/></svg>`,
	balanza: (c) => `<svg viewBox="0 0 120 120"><rect width="120" height="120" fill="${c.main}"/>
		<path d="M60 26v62M40 92h40M30 38h60" stroke="${c.accent}" stroke-width="4" stroke-linecap="round"/>
		<path d="M30 38l-12 26h24zM90 38l-12 26h24z" fill="none" stroke="${c.accent}" stroke-width="3" stroke-linejoin="round"/>
		<path d="M18 64a12 7 0 0 0 24 0zM78 64a12 7 0 0 0 24 0z" fill="${c.accent}"/></svg>`
};

const MAP = (
	c
) => `<svg viewBox="0 0 320 110" width="100%" height="110" preserveAspectRatio="xMidYMid slice">
	<rect width="320" height="110" fill="${c.mapBg}"/>
	<path d="M0 34h320M0 78h320M60 0v110M150 0v110M240 0v110M0 110L130 0" stroke="#fff" stroke-width="7"/>
	<path d="M180 0c10 40 40 60 140 70" stroke="${c.mapRiver}" stroke-width="10" fill="none" opacity=".6"/>
	<rect x="70" y="44" width="70" height="26" rx="4" fill="${c.mapBlock}"/><rect x="250" y="88" width="60" height="22" fill="${c.mapBlock}"/>
	<g transform="translate(150 34)"><path d="M0 -26c-11 0 -19 8 -19 18c0 13 19 30 19 30s19-17 19-30c0-10-8-18-19-18z" fill="${c.main}"/><circle cy="-8" r="7" fill="#fff"/></g>
</svg>`;

// ── Datos de perfiles simulados
const PROFILES = [
	{
		slug: 'valeria-rojas',
		name: 'Valeria Rojas',
		role: 'Agente inmobiliaria y asesora de inversión',
		company: 'Horizonte Propiedades',
		initials: 'HP',
		bio: 'Te ayudo a comprar, vender o invertir con información clara y visitas sin vueltas. Más de 120 operaciones cerradas.',
		c: {
			main: '#1E3A8A',
			accent: '#F59E0B',
			soft: '#DBEAFE',
			ground: '#BBF7D0',
			leaf: '#16A34A',
			trunk: '#78350F',
			glass: '#93C5FD',
			mapBg: '#E5E7EB',
			mapRiver: '#93C5FD',
			mapBlock: '#D1FAE5',
			page: '#F8FAFC'
		},
		cover: 'stripes',
		avatar: { bg: '#BFDBFE', skin: '#E8B796', hair: '#3B2416', cloth: '#1E3A8A', style: 'long' },
		sectionTitle: 'Propiedades destacadas del mes',
		items: [
			{
				t: 'casa',
				title: 'Casa en condominio cerrado',
				meta: '3 dorm., 2 baños, 220 m²',
				price: 'USD 185.000'
			},
			{
				t: 'depto',
				title: 'Departamento con vista al parque',
				meta: '2 dorm., piso 9, 86 m²',
				price: 'USD 98.500'
			}
		],
		branch: {
			name: 'Oficina central',
			addr: 'Av. Las Américas 1450, of. 3',
			hours: 'Abierto hasta las 19:00'
		},
		cta: 'Agendar visita'
	},
	{
		slug: 'dra-camila-rivas',
		name: 'Dra. Camila Rivas',
		role: 'Odontóloga en estética dental',
		company: 'Clínica Sonríe',
		initials: 'CS',
		bio: 'Diseño de sonrisa, blanqueamiento y ortodoncia invisible. Atiendo en dos consultorios con turnos de lunes a sábado.',
		c: {
			main: '#0F766E',
			accent: '#F472B6',
			soft: '#CCFBF1',
			ground: '#99F6E4',
			leaf: '#14B8A6',
			trunk: '#115E59',
			glass: '#99F6E4',
			mapBg: '#E7E5E4',
			mapRiver: '#5EEAD4',
			mapBlock: '#CCFBF1',
			page: '#F7FBFA'
		},
		cover: 'dots',
		avatar: { bg: '#99F6E4', skin: '#D9A07A', hair: '#1C1917', cloth: '#F8FAFC', style: 'bun' },
		sectionTitle: 'Tratamientos',
		items: [
			{
				t: 'sonrisa',
				title: 'Diseño de sonrisa',
				meta: 'Evaluación + plan digital',
				price: 'Desde Bs 3.100'
			},
			{
				t: 'diente',
				title: 'Blanqueamiento LED',
				meta: '1 sesión de 60 minutos',
				price: 'Bs 850',
				old: 'Bs 1.000'
			}
		],
		branch: {
			name: 'Consultorio Centro',
			addr: 'Calle 7 Oeste 23, piso 2',
			hours: 'Abierto hasta las 20:00'
		},
		cta: 'Agendar cita'
	},
	{
		slug: 'andres-quiroga',
		name: 'Andrés Quiroga',
		role: 'Gerente comercial',
		company: 'Andina Logística',
		initials: 'AL',
		bio: 'Coordino transporte refrigerado y almacenaje para empresas de consumo masivo. Escríbeme y cotizamos tu ruta.',
		c: {
			main: '#1F2937',
			accent: '#FACC15',
			soft: '#FEF9C3',
			ground: '#D6D3D1',
			leaf: '#65A30D',
			trunk: '#44403C',
			glass: '#FDE68A',
			mapBg: '#E7E5E4',
			mapRiver: '#A8A29E',
			mapBlock: '#FEF08A',
			page: '#FAFAF9'
		},
		cover: 'chevrons',
		avatar: { bg: '#FDE68A', skin: '#C68B63', hair: '#111827', cloth: '#1F2937', style: 'short' },
		sectionTitle: 'Servicios para tu empresa',
		items: [
			{
				t: 'camion',
				title: 'Transporte refrigerado',
				meta: 'Rutas nacionales con GPS 24/7',
				price: 'Cotizar ruta'
			},
			{
				t: 'almacen',
				title: 'Almacenaje y picking',
				meta: '4.000 m² con temperatura controlada',
				price: 'Cotizar espacio'
			}
		],
		branch: {
			name: 'Centro logístico',
			addr: 'Parque Industrial, Mz. 12',
			hours: 'Abierto hasta las 18:00'
		},
		cta: 'Solicitar cotización'
	},
	{
		slug: 'mariana-ortiz',
		name: 'Mariana Ortiz',
		role: 'Abogada en derecho corporativo',
		company: 'Ortiz & Asociados',
		initials: 'OA',
		bio: 'Asesoro a empresas en contratos, sociedades y relaciones laborales. 14 años de práctica y atención en dos idiomas.',
		c: {
			main: '#163A2E',
			accent: '#C9A86A',
			soft: '#E7EFEA',
			ground: '#D6D3D1',
			leaf: '#3F6212',
			trunk: '#44403C',
			glass: '#D9F99D',
			mapBg: '#E7E5E4',
			mapRiver: '#A8A29E',
			mapBlock: '#E7EFEA',
			page: '#FAFAF7'
		},
		cover: 'lines',
		avatar: { bg: '#E7EFEA', skin: '#EAC0A0', hair: '#5B3A1E', cloth: '#163A2E', style: 'long' },
		sectionTitle: 'Áreas de práctica',
		items: [
			{
				t: 'contrato',
				title: 'Contratos y sociedades',
				meta: 'Constitución, fusiones, due diligence',
				price: 'Primera consulta'
			},
			{
				t: 'balanza',
				title: 'Derecho laboral empresarial',
				meta: 'Reglamentos, auditorías, litigios',
				price: 'Primera consulta'
			}
		],
		branch: {
			name: 'Estudio jurídico',
			addr: 'Torre Empresarial, piso 11',
			hours: 'Abierto hasta las 18:30'
		},
		cta: 'Agendar reunión'
	}
];

const coverPattern = (p) => {
	const { main, accent } = p.c;
	switch (p.cover) {
		case 'stripes':
			return `background:${main};background-image:repeating-linear-gradient(-35deg,transparent 0 22px,rgba(255,255,255,.07) 22px 44px)`;
		case 'dots':
			return `background:${main};background-image:radial-gradient(rgba(255,255,255,.18) 2px,transparent 2.5px);background-size:18px 18px`;
		case 'chevrons':
			return `background:${main};background-image:linear-gradient(135deg,${accent} 0 18%,transparent 18%),repeating-linear-gradient(90deg,transparent 0 30px,rgba(255,255,255,.05) 30px 60px)`;
		default:
			return `background:${main};background-image:repeating-linear-gradient(0deg,transparent 0 14px,rgba(201,168,106,.25) 14px 15px)`;
	}
};

const meSeal = `<svg viewBox="140 300 800 480" width="26" height="16"><g fill="#2a182d"><rect x="147" y="311" width="83" height="458" rx="41.6"/><rect x="428" y="311" width="83" height="458" rx="41.6"/><rect x="568" y="311" width="364" height="83" rx="41.6"/><rect x="568" y="686" width="364" height="83" rx="41.6"/></g><g fill="#ff4724"><rect x="288" y="401" width="83" height="180" rx="41.6"/><rect x="568" y="498" width="364" height="83" rx="41.6"/></g></svg>`;

function profileHtml(p) {
	const c = p.c;
	const action = (ic, label) =>
		`<div class="act"><span class="ic" style="color:${c.main};background:${c.soft}">${icon(I[ic], 20)}</span>${label}</div>`;
	return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${FONTS}
	*{box-sizing:border-box;margin:0;padding:0}
	body{width:390px;font-family:'Jakarta';color:#1c1917;background:${c.page};-webkit-font-smoothing:antialiased}
	.cover{height:150px;${coverPattern(p)};position:relative}
	.badge{position:absolute;top:14px;left:16px;display:flex;align-items:center;gap:8px;color:#fff;font-size:12px;font-weight:600}
	.badge b{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;background:${c.accent};color:${c.main};font-family:'Grotesk';font-size:12px}
	.av{width:108px;height:108px;border-radius:50%;overflow:hidden;border:4px solid ${c.page};margin:-54px auto 0;position:relative;box-shadow:0 0 0 2px ${c.main}}
	.who{text-align:center;padding:12px 24px 0}
	h1{font-family:'Grotesk';font-size:25px;line-height:1.1;letter-spacing:-.02em;color:${c.main}}
	.role{margin-top:6px;font-size:14px;color:#44403c}
	.co{margin-top:4px;font-size:13px;font-weight:700;color:${c.main}}
	.save{margin:18px 20px 0;height:52px;border-radius:999px;background:${c.main};color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:700;font-size:15px}
	.save small{font-family:'Mono';font-size:11px;font-weight:500;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.16)}
	.acts{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:18px 16px 4px}
	.act{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:#44403c}
	.ic{width:46px;height:46px;border-radius:50%;display:grid;place-items:center}
	.bio{margin:14px 20px 0;font-size:13.5px;line-height:1.55;color:#44403c;text-align:center}
	h2{font-family:'Grotesk';font-size:16px;margin:24px 20px 10px;color:${c.main};letter-spacing:-.01em}
	.item{display:flex;gap:12px;margin:0 16px 10px;padding:10px;border-radius:18px;background:#fff;border:1px solid rgba(0,0,0,.07)}
	.item .th{width:84px;height:84px;border-radius:12px;overflow:hidden;flex:none}
	.item .th svg{width:100%;height:100%;display:block}
	.it{display:flex;flex-direction:column;min-width:0;flex:1}
	.it b{font-size:14px;line-height:1.25}
	.it span{font-size:12px;color:#57534e;margin-top:3px}
	.it .row{margin-top:auto;display:flex;align-items:center;justify-content:space-between}
	.it .pr{font-family:'Grotesk';font-weight:700;font-size:14px;color:${c.main}}
	.it .pr s{font-family:'Jakarta';font-weight:500;font-size:11.5px;color:#78716c;margin-left:4px}
	.it .wa{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:#15803d;background:#dcfce7;padding:4px 8px;border-radius:999px}
	.branch{margin:0 16px;border-radius:18px;overflow:hidden;background:#fff;border:1px solid rgba(0,0,0,.07)}
	.branch .bd{padding:12px 14px}
	.branch b{font-size:14px}.branch p{font-size:12.5px;color:#57534e;margin-top:2px}
	.open{display:inline-flex;align-items:center;gap:5px;margin-top:8px;font-size:11.5px;font-weight:700;color:#15803d}
	.cta{margin:16px 20px 0;height:48px;border-radius:999px;border:2px solid ${c.main};color:${c.main};display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;font-size:14px}
	footer{display:flex;align-items:center;justify-content:center;gap:6px;padding:26px 0 30px;font-size:11px;color:#78716c}
	footer b{color:#2a182d;font-weight:700}
	</style></head><body>
	<div class="cover"><div class="badge"><b>${p.initials}</b>${p.company}</div></div>
	<div class="av">${avatar(p.avatar)}</div>
	<div class="who"><h1>${p.name}</h1><p class="role">${p.role}</p><p class="co">${p.company}</p></div>
	<div class="save">${icon(I.down, 20)} Guardar contacto <small>.vcf</small></div>
	<div class="acts">${action('phone', 'Llamar')}${action('wa', 'WhatsApp')}${action('mail', 'Correo')}${action('pin', 'Ubicación')}</div>
	<p class="bio">${p.bio}</p>
	<h2>${p.sectionTitle}</h2>
	${p.items
		.map(
			(
				it
			) => `<div class="item"><div class="th">${thumb[it.t](c)}</div><div class="it"><b>${it.title}</b><span>${it.meta}</span>
		<div class="row"><span class="pr">${it.price}${it.old ? ` <s>${it.old}</s>` : ''}</span><span class="wa">${icon(I.wa, 13)}Consultar</span></div></div></div>`
		)
		.join('')}
	<h2>Sucursal y horario</h2>
	<div class="branch">${MAP(c)}<div class="bd"><b>${p.branch.name}</b><p>${p.branch.addr}</p><span class="open">${icon(I.clock, 14)}${p.branch.hours}</span></div></div>
	<div class="cta">${icon(I.cal, 18)}${p.cta}</div>
	<footer>${meSeal}<span>Perfil creado con <b>ME by Svelpy</b></span></footer>
	</body></html>`;
}

// ── Ejecución
const outProfiles = join(ROOT, 'src/lib/assets/landing/perfiles');
mkdirSync(outProfiles, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

for (const p of PROFILES) {
	await page.setContent(profileHtml(p), { waitUntil: 'load' });
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: join(outProfiles, `${p.slug}.png`), fullPage: true });
	console.log('perfil', p.slug);
}

// QR de la tarjeta física → me.svelpy.com
const qrSvg = await QRCode.toString('https://me.svelpy.com', {
	type: 'svg',
	margin: 0,
	errorCorrectionLevel: 'H',
	color: { dark: '#2a182dff', light: '#00000000' }
});
writeFileSync(join(ROOT, 'src/lib/assets/landing/qr-me-svelpy.svg'), qrSvg);
console.log('qr ok');

// Imagen Open Graph 1200x630
const logo = readFileSync(
	join(ROOT, 'static/images/logo_completo_ME_by_Svelpy/SVG/me-by-svelpy-oscuro.svg'),
	'utf8'
);
const shot = readFileSync(join(outProfiles, 'dra-camila-rivas.png')).toString('base64');
const shot2 = readFileSync(join(outProfiles, 'valeria-rojas.png')).toString('base64');
const og = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#1c0f1e;color:#fff;font-family:'Jakarta';overflow:hidden;position:relative}
.logo{position:absolute;left:64px;top:44px;width:150px;height:150px}
.logo svg{width:100%;height:100%}
h1{position:absolute;left:72px;top:200px;width:560px;font-family:'Grotesk';font-weight:700;font-size:54px;line-height:1.04;letter-spacing:-.035em}
.url{position:absolute;left:72px;bottom:58px;font-family:'Mono';font-size:24px;color:#ff4724}
.url span{color:#c8bccb}
.ph{position:absolute;width:260px;height:540px;border-radius:44px;background:#3b2540;padding:10px;box-shadow:0 0 0 2px #503756}
.ph div{width:100%;height:100%;border-radius:34px;background-size:100% auto;background-position:top;background-repeat:no-repeat}
.a{right:250px;top:70px;transform:rotate(-4deg)}
.b{right:-20px;top:120px;transform:rotate(5deg)}
.pill{position:absolute;right:120px;top:40px;width:200px;height:56px;border-radius:999px;background:#ff4724}
</style></head><body>
<div class="logo">${logo}</div>
<h1>Que no solo guarden tu contacto: haz que te encuentren primero.</h1>
<p class="url"><span>me.svelpy.com/</span>tu-nombre</p>
<div class="ph b"><div style="background-image:url(data:image/png;base64,${shot2})"></div></div>
<div class="ph a"><div style="background-image:url(data:image/png;base64,${shot})"></div></div>
</body></html>`;
const ogPage = await browser.newPage({
	viewport: { width: 1200, height: 630 },
	deviceScaleFactor: 1
});
await ogPage.setContent(og, { waitUntil: 'load' });
await ogPage.evaluate(() => document.fonts.ready);
mkdirSync(join(ROOT, 'static/images/landing'), { recursive: true });
await ogPage.screenshot({ path: join(ROOT, 'static/images/landing/og-me-by-svelpy.png') });
console.log('og ok');
await browser.close();
