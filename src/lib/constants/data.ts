import type { Role } from '#lib/config/permissions.config.ts';
import type { Plan } from '#lib/config/planes.config.ts';
import type {
	ContactoTipo,
	DiaSemana,
	FabPosicion,
	IconoForma,
	NombreEmpresaPosicion,
	RedSocial
} from '#lib/interfaces/index.ts';

export const NO_DATA_LABEL = '—';

/** Límites de paginación que acepta la API (`per_page`: 1–100) */
export const PAGINATION = {
	DEFAULT_PAGE: 1,
	DEFAULT_PER_PAGE: 20,
	MAX_PER_PAGE: 100,
	PER_PAGE_OPTIONS: [10, 20, 50, 100]
} as const;

/** Etiquetas de rol de usuario (valores que devuelve la API) */
export const ROLE_LABEL: Record<Role, string> = {
	SUPERADMIN: 'Superadministrador',
	OWNER: 'Propietario'
};

/** Nombre visible de cada plan (enum `plan`) */
export const PLAN_LABEL: Record<Plan, string> = {
	free: 'Free',
	pro: 'Pro'
};

export const CONTACTO_TIPO_LABEL: Record<ContactoTipo, string> = {
	phone: 'Teléfono',
	email: 'Correo',
	website: 'Sitio web'
};

/** Nombre visible de cada red (enum `red_social`), en el orden en que se ofrecen */
export const RED_SOCIAL_LABEL: Record<RedSocial, string> = {
	instagram: 'Instagram',
	facebook: 'Facebook',
	tiktok: 'TikTok',
	linkedin: 'LinkedIn',
	youtube: 'YouTube',
	x: 'X',
	threads: 'Threads',
	bluesky: 'Bluesky',
	pinterest: 'Pinterest',
	twitch: 'Twitch',
	vimeo: 'Vimeo',
	spotify: 'Spotify',
	soundcloud: 'SoundCloud',
	medium: 'Medium',
	substack: 'Substack',
	github: 'GitHub',
	gitlab: 'GitLab',
	behance: 'Behance',
	dribbble: 'Dribbble',
	telegram: 'Telegram',
	discord: 'Discord',
	calendly: 'Calendly',
	doctoralia: 'Doctoralia',
	otro: 'Otro enlace'
};

export const REDES_SOCIALES = Object.keys(RED_SOCIAL_LABEL) as RedSocial[];

/** Redes que sirven para agendar: en la tarjeta se muestran como botón "Agendar cita" */
export const REDES_AGENDA: readonly RedSocial[] = ['calendly', 'doctoralia'];

export const DIA_SEMANA_LABEL: Record<DiaSemana, string> = {
	1: 'Lunes',
	2: 'Martes',
	3: 'Miércoles',
	4: 'Jueves',
	5: 'Viernes',
	6: 'Sábado',
	7: 'Domingo'
};

export const DIA_SEMANA_CORTO: Record<DiaSemana, string> = {
	1: 'Lun',
	2: 'Mar',
	3: 'Mié',
	4: 'Jue',
	5: 'Vie',
	6: 'Sáb',
	7: 'Dom'
};

export const DIAS_SEMANA: DiaSemana[] = [1, 2, 3, 4, 5, 6, 7];

export const NOMBRE_EMPRESA_POSICION_LABEL: Record<NombreEmpresaPosicion, string> = {
	arriba: 'En la portada',
	abajo: 'Bajo el cargo',
	izquierda: 'Insignia a la izquierda',
	derecha: 'Insignia a la derecha',
	oculto: 'No mostrar'
};

export const ICONO_FORMA_LABEL: Record<IconoForma, string> = {
	circulo: 'Círculo',
	redondeado: 'Redondeado',
	cuadrado: 'Cuadrado',
	ninguno: 'Sin fondo'
};

export const FAB_POSICION_LABEL: Record<FabPosicion, string> = {
	derecha: 'Derecha',
	izquierda: 'Izquierda'
};

/** Monedas de la vitrina (ISO 4217) */
export const MONEDAS = [
	{ codigo: 'BOB', nombre: 'Boliviano (Bs)' },
	{ codigo: 'USD', nombre: 'Dólar estadounidense' },
	{ codigo: 'PEN', nombre: 'Sol peruano' },
	{ codigo: 'ARS', nombre: 'Peso argentino' },
	{ codigo: 'CLP', nombre: 'Peso chileno' },
	{ codigo: 'COP', nombre: 'Peso colombiano' },
	{ codigo: 'MXN', nombre: 'Peso mexicano' },
	{ codigo: 'PYG', nombre: 'Guaraní paraguayo' },
	{ codigo: 'UYU', nombre: 'Peso uruguayo' },
	{ codigo: 'BRL', nombre: 'Real brasileño' },
	{ codigo: 'EUR', nombre: 'Euro' }
] as const;

export const MONEDA_POR_DEFECTO = 'BOB';

/** Sugerencias para `tarjeta_ubicacion.departamento` (el campo es libre) */
export const DEPARTAMENTOS_BOLIVIA = [
	'Santa Cruz',
	'La Paz',
	'Cochabamba',
	'Chuquisaca',
	'Tarija',
	'Oruro',
	'Potosí',
	'Beni',
	'Pando'
] as const;

export const PAIS_POR_DEFECTO = 'Bolivia';

/** Código de país que se antepone a los números locales en los enlaces de WhatsApp */
export const CODIGO_PAIS_POR_DEFECTO = '591';

export const PREFIJOS_SUGERIDOS = ['Dr.', 'Dra.', 'Lic.', 'Ing.', 'Arq.', 'Abg.', 'MSc.', 'Prof.'];

/** Páginas legales públicas: se enlazan desde la landing, el login, el registro y entre sí */
export const LEGAL_PAGES = [
	{ href: '/(legal)/terminos', label: 'Términos y condiciones' },
	{ href: '/(legal)/privacidad', label: 'Política de privacidad' },
	{ href: '/(legal)/cookies', label: 'Política de cookies' }
] as const;
