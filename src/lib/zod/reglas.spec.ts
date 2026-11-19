import { describe, expect, it } from 'vitest';
import { passwordSchema, precioOpcional } from './common.ts';
import { ubicacionHorariosSchema, ubicacionHorarioSchema } from './tarjetaUbicacion.schema.ts';

describe('horarios', () => {
	it('el cierre tiene que ser después de la apertura', () => {
		const resultado = ubicacionHorarioSchema.safeParse({
			dia_semana: 1,
			hora_inicio: '18:00',
			hora_fin: '09:00'
		});
		expect(resultado.success).toBe(false);
		expect(resultado.error?.issues[0]).toMatchObject({
			path: ['hora_fin'],
			message: 'El cierre debe ser después de la apertura.'
		});
	});

	it('marca el turno que se cruza con otro del mismo día', () => {
		const resultado = ubicacionHorariosSchema.safeParse([
			{ dia_semana: 2, hora_inicio: '08:00', hora_fin: '12:00' },
			{ dia_semana: 2, hora_inicio: '11:30', hora_fin: '14:00' }
		]);
		expect(resultado.success).toBe(false);
		expect(resultado.error?.issues[0]).toMatchObject({
			path: [1, 'hora_inicio'],
			message: 'Se cruza con otro horario del mismo día.'
		});
	});

	it('acepta horas con segundos y turnos seguidos', () => {
		expect(
			ubicacionHorariosSchema.safeParse([
				{ dia_semana: 3, hora_inicio: '08:00:00', hora_fin: '12:00:00' },
				{ dia_semana: 3, hora_inicio: '12:00', hora_fin: '16:00' }
			]).success
		).toBe(true);
	});
});

describe('precios', () => {
	it('sin precio queda en null ("Consultar") y redondea a centavos', () => {
		const precio = precioOpcional('Precio');
		expect(precio.parse(undefined)).toBeNull();
		expect(precio.parse(null)).toBeNull();
		expect(precio.parse(199.999)).toBe(200);
		expect(precio.parse(12.345)).toBe(12.35);
	});

	it('no acepta precios negativos', () => {
		expect(precioOpcional('Precio').safeParse(-1).success).toBe(false);
	});
});

describe('contraseñas', () => {
	it('piden 8 caracteres con letras y números', () => {
		expect(passwordSchema.safeParse('Demo1234').success).toBe(true);
		expect(passwordSchema.safeParse('corta1').success).toBe(false);
		expect(passwordSchema.safeParse('solamenteletras').success).toBe(false);
		expect(passwordSchema.safeParse('12345678').success).toBe(false);
	});
});
