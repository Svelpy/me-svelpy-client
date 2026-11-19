import { z } from 'zod';
import { aMinutos, buscarSolape } from '#lib/utils/horarios.ts';
import { booleanoOpcional, texto, textoOpcional, urlHttpsOpcional } from './common';

const HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export const ubicacionHorarioSchema = z
	.object({
		dia_semana: z.literal([1, 2, 3, 4, 5, 6, 7], { message: 'Elige un día.' }),
		hora_inicio: z.string().regex(HORA, { message: 'Usa el formato 08:30.' }),
		hora_fin: z.string().regex(HORA, { message: 'Usa el formato 18:00.' })
	})
	.refine((franja) => aMinutos(franja.hora_fin) > aMinutos(franja.hora_inicio), {
		message: 'El cierre debe ser después de la apertura.',
		path: ['hora_fin']
	});

export const ubicacionHorariosSchema = z
	.array(ubicacionHorarioSchema)
	.max(42, { message: 'Hasta 6 horarios por día.' })
	.superRefine((horarios, ctx) => {
		const solape = buscarSolape(horarios);
		if (solape) {
			ctx.addIssue({
				code: 'custom',
				path: [solape[1], 'hora_inicio'],
				message: 'Se cruza con otro horario del mismo día.'
			});
		}
	});

const coordenada = (etiqueta: string, limite: number) =>
	z
		.number({ message: `${etiqueta}: ingresa un número.` })
		.min(-limite, { message: `${etiqueta} va de -${limite} a ${limite}.` })
		.max(limite, { message: `${etiqueta} va de -${limite} a ${limite}.` })
		.nullish()
		.transform((valor) =>
			valor === null || valor === undefined ? null : Number(valor.toFixed(6))
		);

export const tarjetaUbicacionSchema = z
	.object({
		nombre: textoOpcional('El nombre', 150),
		direccion: texto('La dirección', 255),
		ciudad: textoOpcional('La ciudad', 100),
		departamento: textoOpcional('El departamento', 100),
		pais: textoOpcional('El país', 100),
		maps_url: urlHttpsOpcional('El enlace de Google Maps'),
		lat: coordenada('La latitud', 90),
		lng: coordenada('La longitud', 180),
		is_visible: booleanoOpcional(),
		horarios: ubicacionHorariosSchema.optional()
	})
	.superRefine((ubicacion, ctx) => {
		if ((ubicacion.lat === null) !== (ubicacion.lng === null)) {
			const path = ubicacion.lat === null ? 'lat' : 'lng';
			ctx.addIssue({ code: 'custom', path: [path], message: 'Ingresa latitud y longitud juntas.' });
		}
	});

/** Cuerpo de `PUT /ubicaciones/{id}/horarios` */
export const ubicacionHorariosUpdateSchema = z.object({ horarios: ubicacionHorariosSchema });
