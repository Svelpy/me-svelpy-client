import { describe, expect, it } from 'vitest';
import type { DiaSemana } from '#lib/interfaces/index.ts';
import { buscarSolape, estadoApertura, resumenSemanal, textoFranjas } from './horarios.ts';

const franja = (dia_semana: DiaSemana, hora_inicio: string, hora_fin: string) => ({
	dia_semana,
	hora_inicio,
	hora_fin
});

// Lunes a viernes en dos turnos y sábado por la mañana
const SEMANA = [
	...([1, 2, 3, 4, 5] as const).flatMap((dia) => [
		franja(dia, '08:30', '12:30'),
		franja(dia, '15:00', '19:00')
	]),
	franja(6, '09:00', '13:00')
];

/** 5 de enero de 2026 fue lunes; `dia` 1 = lunes … 7 = domingo, hora local */
const el = (dia: DiaSemana, hora: string) => {
	const [h, m] = hora.split(':').map(Number);
	return new Date(2026, 0, 4 + dia, h, m);
};

describe('estadoApertura', () => {
	it('abierto: dice hasta cuándo', () => {
		expect(estadoApertura(SEMANA, el(1, '10:00'))).toEqual({
			abierto: true,
			texto: 'Abierto hasta las 12:30'
		});
	});

	it('cerrado entre turnos: abre hoy más tarde', () => {
		expect(estadoApertura(SEMANA, el(1, '13:15'))?.texto).toBe('Cerrado. Abre hoy a las 15:00');
	});

	it('al cerrar a la hora exacta ya está cerrado', () => {
		expect(estadoApertura(SEMANA, el(6, '13:00'))?.abierto).toBe(false);
	});

	it('cerrado de noche: abre mañana', () => {
		expect(estadoApertura(SEMANA, el(5, '20:00'))?.texto).toBe('Cerrado. Abre mañana a las 09:00');
	});

	it('salta los días sin horario hasta el próximo que abre', () => {
		expect(estadoApertura(SEMANA, el(6, '14:00'))?.texto).toBe(
			'Cerrado. Abre el lunes a las 08:30'
		);
	});

	it('sin horarios no hay estado que mostrar', () => {
		expect(estadoApertura([], el(1, '10:00'))).toBeNull();
	});
});

describe('resumenSemanal', () => {
	it('agrupa los días seguidos con el mismo horario', () => {
		expect(resumenSemanal(SEMANA).map(({ dias, horas }) => ({ dias, horas }))).toEqual([
			{ dias: 'Lunes a viernes', horas: '08:30 a 12:30 y 15:00 a 19:00' },
			{ dias: 'Sábado', horas: '09:00 a 13:00' },
			{ dias: 'Domingo', horas: 'Cerrado' }
		]);
	});

	it('dos días seguidos se unen con "y"', () => {
		const resumen = resumenSemanal([franja(6, '10:00', '14:00'), franja(7, '10:00', '14:00')]);
		expect(resumen.at(-1)).toMatchObject({ dias: 'Sábado y domingo', incluye: [6, 7] });
	});
});

describe('textoFranjas', () => {
	it('enumera los turnos y acepta horas con segundos', () => {
		expect(
			textoFranjas([
				franja(1, '08:00:00', '10:00:00'),
				franja(1, '11:00', '13:00'),
				franja(1, '15:00', '18:00')
			])
		).toBe('08:00 a 10:00, 11:00 a 13:00 y 15:00 a 18:00');
		expect(textoFranjas([])).toBe('Cerrado');
	});
});

describe('buscarSolape', () => {
	it('encuentra dos turnos del mismo día que se pisan', () => {
		expect(buscarSolape([franja(1, '08:00', '12:00'), franja(1, '11:00', '13:00')])).toEqual([
			0, 1
		]);
	});

	it('turnos seguidos o en días distintos no se pisan', () => {
		expect(buscarSolape([franja(1, '08:00', '12:00'), franja(1, '12:00', '14:00')])).toBeNull();
		expect(buscarSolape([franja(1, '08:00', '12:00'), franja(2, '08:00', '12:00')])).toBeNull();
	});
});
