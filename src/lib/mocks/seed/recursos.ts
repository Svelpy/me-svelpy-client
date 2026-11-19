import type { DiaSemana, UbicacionHorarioInput } from '#lib/interfaces/index.ts';

/**
 * Imágenes públicas para los datos de prueba (verificadas: responden 200 y muestran lo que dice su
 * nombre). Unsplash para fotos, ui-avatars para logos y qrserver para los QR de pago.
 */

const unsplash = (id: string, ancho: number, alto: number, extra = '') =>
	`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${ancho}&h=${alto}&q=75${extra}`;

/** Foto de perfil cuadrada, centrada en la cara */
export const retrato = (id: string) => unsplash(id, 480, 480, '&crop=faces');
/** Portada panorámica */
export const portada = (id: string) => unsplash(id, 1400, 640);
/** Foto de un ítem de la vitrina (4:3) */
export const foto = (id: string) => unsplash(id, 960, 720);

/** Logo cuadrado con iniciales (los colores, en hex sin #) */
export const logo = (nombre: string, fondo: string, texto = 'FFFFFF') =>
	`https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=${fondo}&color=${texto}&size=256&bold=true&format=png`;

/** QR de pago de prueba (no cobra nada) */
export const qrPago = (slug: string) =>
	`https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=12&data=${encodeURIComponent(`QR de pago de prueba: ${slug}`)}`;

export const IMAGENES = {
	retratos: {
		fabiola: '1559839734-2b71ea197ec2',
		camila: '1594824476967-48c8b964273f',
		valeria: '1573497019940-1c28c88b4f3e',
		andres: '1560250097-0b93528c311a',
		mariana: '1573496359142-b8d87734a5a2',
		rodrigo: '1507003211169-0a1dd7228f2d',
		lucia: '1438761681033-6461ffad8d80',
		andrea: '1580489944761-15a19d654956',
		martin: '1500648767791-00dcc994a43e',
		diego: '1506794778202-cad84cf45f1d',
		paola: '1494790108377-be9c29b29330',
		jorge: '1472099645785-5658abf4ff4e'
	},
	salud: {
		ninaSonriendo: '1503454537195-1dcabb73ffb9',
		estetoscopio: '1532938911079-1b06ac7ceec7',
		equipoMedico: '1579684385127-1ef15d508118',
		consultaDigital: '1576091160550-2173dba999ef',
		dentistaRadiografia: '1588776814546-1ffcf47267a5',
		revisionDental: '1606811971618-4486d14f3f99',
		alineadorDental: '1609840114035-3c981b782dfe'
	},
	inmuebles: {
		casaModernaNoche: '1600585154340-be6161a56a0c',
		casaPiscina: '1600596542815-ffad4c1539a9',
		casaBlanca: '1512917774080-9991f1c4c750',
		casaPalmeras: '1564013799919-ab600027ffc6',
		living: '1502672260266-1c1ef2d93688',
		departamento: '1522708323590-d24dbb6b0267',
		dormitorio: '1505693416388-ac5ce068fe85',
		salaAmplia: '1600210492486-724fe5c67fb0',
		casaCondominio: '1613490493576-7fde63acd811'
	},
	arquitectura: {
		edificio: '1487958449943-2429e8be8625',
		planos: '1503387762-592deb58ef4e',
		interiorModerno: '1600607687939-ce8a6c25118c',
		casaContemporanea: '1600566753190-17f0baa2a6c3',
		casaDosPisos: '1600047509807-ba8f99d2cdde',
		interiorCalido: '1618221195710-dd6b41faaea6'
	},
	empresa: {
		oficina: '1497366216548-37526070297c',
		justicia: '1589829545856-d10d557cf95f',
		biblioteca: '1505664194779-8beaceb93744',
		firma: '1450101499163-c8848c66ca85',
		contrato: '1521791055366-0d553872125f',
		reunion: '1600880292203-757bb62b4baf',
		almacen: '1586528116311-ad8dd3c8310d',
		puerto: '1494412574643-ff11b0a5c1c3',
		camionRuta: '1519003722824-194d4455a60c',
		camionScania: '1601584115197-04ecc0da31d7'
	},
	comida: {
		restaurante: '1517248135467-4c7edcad34c4',
		mesaPlatos: '1504674900247-0877df9cc836',
		carneConPapas: '1600891964092-4316c288032e',
		costillas: '1544025162-d76694265947',
		sopa: '1559847844-5315695dadae',
		ensalada: '1546069901-ba9599a7e63c',
		cupcakes: '1563729784474-d77dbb933a9e'
	},
	fotografia: {
		pareja: '1511285560929-80b456fea0bc',
		parejaJardin: '1606216794074-735e91aa2c92',
		anillos: '1606800052052-a08af7148866',
		ramo: '1519741497674-611481863552',
		camara: '1516035069371-29a1b244cc32'
	},
	bienestar: {
		montanas: '1470071459604-3b5ec3a7fe05',
		manos: '1584515933487-779824d29309',
		videollamada: '1612831455359-970e23a1e4e9',
		meditacion: '1506126613408-eca07ce68773',
		conversacion: '1527689368864-3a821dbccc34'
	},
	deporte: {
		barra: '1517836357463-d25dfeac3438',
		gimnasio: '1534438327276-14e5300c3a48',
		entrenamiento: '1581009146145-b5ef050c2e1e',
		ejercicioCasa: '1571019613454-1cb2f99b2d8b',
		zapatillas: '1549060279-7e168fcee0c2'
	},
	belleza: {
		salon: '1560066984-138dadb4c035',
		cabello: '1522337360788-8b13dee7a37e',
		corte: '1562322140-8baeececf3df',
		maquillaje: '1487412947147-5cebf100ffc2',
		herramientas: '1527799820374-dcf8d9d4a388'
	}
} as const;

/** Franjas para los días indicados: `semana([1, 2, 3], ['08:00', '12:00'], ['14:00', '18:00'])` */
export function semana(dias: DiaSemana[], ...franjas: [string, string][]): UbicacionHorarioInput[] {
	return dias.flatMap((dia_semana) =>
		franjas.map(([hora_inicio, hora_fin]) => ({ dia_semana, hora_inicio, hora_fin }))
	);
}

export const LUNES_A_VIERNES: DiaSemana[] = [1, 2, 3, 4, 5];
