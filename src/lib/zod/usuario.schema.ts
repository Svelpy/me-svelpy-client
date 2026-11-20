import { z } from 'zod';
import { ASSIGNABLE_USER_ROLES } from '#lib/config/permissions.config.ts';
import { Plan, PLANES } from '#lib/config/planes.config.ts';
import { emailSchema, passwordSchema } from './common';
import { tarjetaNuevaSchema } from './tarjeta.schema';

const rolSchema = z.enum(ASSIGNABLE_USER_ROLES, { message: 'Elige el rol.' });

export const planSchema = z.enum(PLANES, { message: 'Elige el plan.' });

/** Fin del plan pro: fecha y hora ISO en el futuro; null = no vence */
export const planVenceSchema = z
	.string({ message: 'La fecha de vencimiento no es válida.' })
	.refine((valor) => !Number.isNaN(Date.parse(valor)), {
		message: 'La fecha de vencimiento no es válida.'
	})
	.refine((valor) => Date.parse(valor) > Date.now(), {
		message: 'La fecha de vencimiento tiene que ser futura.'
	})
	.nullish();

/** Solo el plan pro vence */
const soloProVence = (datos: { plan?: Plan; plan_vence_at?: string | null }) =>
	!(datos.plan === Plan.FREE && datos.plan_vence_at);
const SOLO_PRO_VENCE = {
	message: 'Solo el plan Pro tiene vencimiento.',
	path: ['plan_vence_at']
};

/** `POST /usuarios`: con `tarjeta` se crea también su tarjeta en la misma petición */
export const usuarioCreateSchema = z
	.object({
		email: emailSchema,
		password: passwordSchema,
		rol: rolSchema,
		is_active: z.boolean().optional(),
		plan: planSchema.optional(),
		plan_vence_at: planVenceSchema,
		tarjeta: tarjetaNuevaSchema.optional()
	})
	.refine(soloProVence, SOLO_PRO_VENCE);

/** `PATCH /usuarios/{id}` */
export const usuarioUpdateSchema = z
	.object({
		email: emailSchema.optional(),
		rol: rolSchema.optional(),
		is_active: z.boolean().optional(),
		plan: planSchema.optional(),
		plan_vence_at: planVenceSchema
	})
	.refine(soloProVence, SOLO_PRO_VENCE);

/** `PUT /usuarios/{id}/password` */
export const usuarioPasswordSchema = z.object({ password: passwordSchema });

/**
 * `POST /auth/registro`: la cuenta y su tarjeta en un paso. Rol, plan y publicación no se aceptan:
 * siempre nace propietario, free y en borrador.
 */
export const registroSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	tarjeta: tarjetaNuevaSchema.omit({ is_public: true })
});
