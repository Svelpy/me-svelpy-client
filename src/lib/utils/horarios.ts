import { DIA_SEMANA_LABEL, DIAS_SEMANA } from '#lib/constants/data.ts';
import type { DiaSemana, UbicacionHorarioInput } from '#lib/interfaces/index.ts';

/** Horarios de atención (`ubicacion_horario`): horas HH:MM de 24 horas, día 1 lunes … 7 domingo */

type Franja = Pick<UbicacionHorarioInput, 'dia_semana' | 'hora_inicio' | 'hora_fin'>;

const HORA = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export function esHoraValida(hora: string): boolean {
	return HORA.test(hora);
}

/** "08:30" → 510 */
export function aMinutos(hora: string): number {
	const [h, m] = hora.split(':').map(Number);
	return h * 60 + m;
}

/** "08:00:00" o "08:00" → "08:00" */
export function horaCorta(hora: string): string {
	return hora.slice(0, 5);
}

/** Día de la semana de una fecha local (1 lunes … 7 domingo) */
export function diaSemanaDe(fecha: Date): DiaSemana {
	const dia = fecha.getDay();
	return (dia === 0 ? 7 : dia) as DiaSemana;
}

/** Franjas de cada día, ordenadas por hora de inicio */
export function horariosPorDia<T extends Franja>(horarios: T[]): Map<DiaSemana, T[]> {
	const porDia = new Map<DiaSemana, T[]>(DIAS_SEMANA.map((dia) => [dia, []]));
	for (const franja of horarios) porDia.get(franja.dia_semana)?.push(franja);
	for (const franjas of porDia.values()) {
		franjas.sort((a, b) => aMinutos(a.hora_inicio) - aMinutos(b.hora_inicio));
	}
	return porDia;
}

/** Primer par de franjas del mismo día que se pisan (índices en `horarios`); null si no hay */
export function buscarSolape(horarios: Franja[]): [number, number] | null {
	for (let i = 0; i < horarios.length; i++) {
		for (let j = i + 1; j < horarios.length; j++) {
			const a = horarios[i];
			const b = horarios[j];
			if (a.dia_semana !== b.dia_semana) continue;
			const seCruzan =
				aMinutos(a.hora_inicio) < aMinutos(b.hora_fin) &&
				aMinutos(b.hora_inicio) < aMinutos(a.hora_fin);
			if (seCruzan) return [i, j];
		}
	}
	return null;
}

/** "08:00 a 12:00 y 14:00 a 20:00"; "Cerrado" si no hay franjas */
export function textoFranjas(franjas: Franja[]): string {
	if (franjas.length === 0) return 'Cerrado';
	const textos = franjas.map((f) => `${horaCorta(f.hora_inicio)} a ${horaCorta(f.hora_fin)}`);
	return textos.length === 1
		? textos[0]
		: `${textos.slice(0, -1).join(', ')} y ${textos[textos.length - 1]}`;
}

export interface EstadoApertura {
	abierto: boolean;
	/** "Abierto hasta las 20:00", "Cerrado. Abre mañana a las 08:00" */
	texto: string;
}

/**
 * Si el lugar está abierto ahora y hasta cuándo, o cuándo vuelve a abrir. Usa la hora local del
 * visitante. null si la ubicación no tiene horarios.
 */
export function estadoApertura(
	horarios: Franja[],
	ahora: Date = new Date()
): EstadoApertura | null {
	if (horarios.length === 0) return null;
	const porDia = horariosPorDia(horarios);
	const hoy = diaSemanaDe(ahora);
	const minuto = ahora.getHours() * 60 + ahora.getMinutes();

	const franjasHoy = porDia.get(hoy) ?? [];
	const actual = franjasHoy.find(
		(f) => aMinutos(f.hora_inicio) <= minuto && minuto < aMinutos(f.hora_fin)
	);
	if (actual) return { abierto: true, texto: `Abierto hasta las ${horaCorta(actual.hora_fin)}` };

	const masTarde = franjasHoy.find((f) => aMinutos(f.hora_inicio) > minuto);
	if (masTarde) {
		return { abierto: false, texto: `Cerrado. Abre hoy a las ${horaCorta(masTarde.hora_inicio)}` };
	}

	for (let salto = 1; salto <= 7; salto++) {
		const dia = (((hoy - 1 + salto) % 7) + 1) as DiaSemana;
		const primera = porDia.get(dia)?.[0];
		if (!primera) continue;
		const cuando = salto === 1 ? 'mañana' : `el ${DIA_SEMANA_LABEL[dia].toLowerCase()}`;
		return {
			abierto: false,
			texto: `Cerrado. Abre ${cuando} a las ${horaCorta(primera.hora_inicio)}`
		};
	}
	return { abierto: false, texto: 'Cerrado' };
}

export interface ResumenDias {
	/** "Lunes a viernes", "Sábado" */
	dias: string;
	/** "08:00 a 12:00 y 14:00 a 20:00" o "Cerrado" */
	horas: string;
	/** Días que abarca, para resaltar el de hoy */
	incluye: DiaSemana[];
}

/** Agrupa los días seguidos que tienen el mismo horario: "Lunes a viernes: 08:00 a 18:00" */
export function resumenSemanal(horarios: Franja[]): ResumenDias[] {
	const porDia = horariosPorDia(horarios);
	const grupos: ResumenDias[] = [];
	for (const dia of DIAS_SEMANA) {
		const horas = textoFranjas(porDia.get(dia) ?? []);
		const ultimo = grupos[grupos.length - 1];
		const anterior = ultimo?.incluye[ultimo.incluye.length - 1];
		if (ultimo && ultimo.horas === horas && anterior === dia - 1) {
			ultimo.incluye.push(dia);
		} else {
			grupos.push({ dias: '', horas, incluye: [dia] });
		}
	}
	for (const grupo of grupos) {
		const primero = DIA_SEMANA_LABEL[grupo.incluye[0]];
		const ultimo = DIA_SEMANA_LABEL[grupo.incluye[grupo.incluye.length - 1]].toLowerCase();
		grupo.dias =
			grupo.incluye.length === 1
				? primero
				: grupo.incluye.length === 2
					? `${primero} y ${ultimo}`
					: `${primero} a ${ultimo}`;
	}
	return grupos;
}
