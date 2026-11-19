import { z } from 'zod';
import { booleanoOpcional, fechaOpcional, texto, textoOpcional, urlHttpsOpcional } from './common';

/** Educación, certificaciones y preguntas frecuentes de la tarjeta */

export const tarjetaEducacionSchema = z
	.object({
		institucion: texto('La institución', 200),
		titulo: textoOpcional('El título', 200),
		area_estudio: textoOpcional('El área de estudio', 200),
		descripcion: textoOpcional('La descripción', 1000),
		fecha_inicio: fechaOpcional('La fecha de inicio'),
		fecha_fin: fechaOpcional('La fecha de fin'),
		is_actual: booleanoOpcional(),
		is_visible: booleanoOpcional()
	})
	.superRefine((educacion, ctx) => {
		if (educacion.is_actual && educacion.fecha_fin) {
			ctx.addIssue({
				code: 'custom',
				path: ['fecha_fin'],
				message: 'Si lo sigues cursando, deja vacía la fecha de fin.'
			});
		}
		if (
			educacion.fecha_inicio &&
			educacion.fecha_fin &&
			educacion.fecha_fin < educacion.fecha_inicio
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['fecha_fin'],
				message: 'La fecha de fin no puede ser anterior al inicio.'
			});
		}
	});

export const tarjetaCertificacionSchema = z
	.object({
		nombre: texto('El nombre', 200),
		entidad_emisora: textoOpcional('La entidad emisora', 200),
		codigo_credencial: textoOpcional('El código', 150),
		url_credencial: urlHttpsOpcional('El enlace de verificación'),
		fecha_emision: fechaOpcional('La fecha de emisión'),
		fecha_expiracion: fechaOpcional('La fecha de vencimiento'),
		no_expira: booleanoOpcional(),
		descripcion: textoOpcional('La descripción', 1000),
		is_visible: booleanoOpcional()
	})
	.superRefine((certificacion, ctx) => {
		if (certificacion.no_expira && certificacion.fecha_expiracion) {
			ctx.addIssue({
				code: 'custom',
				path: ['fecha_expiracion'],
				message: 'Si no vence, deja vacía la fecha de vencimiento.'
			});
		}
		if (
			certificacion.fecha_emision &&
			certificacion.fecha_expiracion &&
			certificacion.fecha_expiracion < certificacion.fecha_emision
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['fecha_expiracion'],
				message: 'El vencimiento no puede ser anterior a la emisión.'
			});
		}
	});

export const tarjetaFaqSchema = z.object({
	pregunta: texto('La pregunta', 300),
	respuesta: texto('La respuesta', 2000),
	is_visible: booleanoOpcional()
});
