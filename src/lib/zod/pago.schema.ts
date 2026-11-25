import { z } from 'zod';
import type { MetodoPago } from '#lib/interfaces/index.ts';
import { textoOpcional, urlImagenOpcional } from './common';

export const METODOS_PAGO = [
	'qr',
	'transferencia',
	'tarjeta',
	'efectivo',
	'otro'
] as const satisfies readonly MetodoPago[];

/** Monto con hasta dos decimales, mayor que cero */
const montoSchema = z
	.number({ message: 'Ingresa el monto, como 80 o 79,50.' })
	.positive({ message: 'El monto tiene que ser mayor que cero.' })
	.max(9_999_999_999.99, { message: 'El monto es demasiado alto.' })
	.transform((valor) => Math.round(valor * 100) / 100);

/**
 * `POST /pagos/registrar`. Sin monto se cobra el precio del plan; con monto (una oferta) no puede
 * superarlo: lo compara el formulario con el precio del plan elegido y lo vuelve a validar el backend.
 */
export const pagoCreateSchema = z.object({
	user_id: z.string({ message: 'Elige la cuenta.' }).min(1, { message: 'Elige la cuenta.' }),
	plan_id: z.string({ message: 'Elige el plan.' }).min(1, { message: 'Elige el plan.' }),
	monto: montoSchema.nullish().transform((valor) => valor ?? null),
	metodo: z.enum(METODOS_PAGO, { message: 'Elige cómo pagó.' }),
	referencia_externa: textoOpcional('La referencia', 100),
	comprobante_url: urlImagenOpcional('El comprobante'),
	idempotency_key: z.string().min(1).max(64)
});

/** `PATCH /planes/{id}` (el código no se edita) */
export const planUpdateSchema = z.object({
	nombre: z
		.string({ message: 'El nombre es obligatorio.' })
		.trim()
		.min(1, { message: 'El nombre es obligatorio.' })
		.max(60, { message: 'El nombre admite hasta 60 caracteres.' }),
	precio: z
		.number({ message: 'Ingresa el precio, como 80 o 79,50.' })
		.min(0, { message: 'El precio no puede ser negativo.' })
		.max(9_999_999_999.99, { message: 'El precio es demasiado alto.' })
		.transform((valor) => Math.round(valor * 100) / 100),
	moneda: z
		.string()
		.trim()
		.toUpperCase()
		.regex(/^[A-Z]{3}$/, { message: 'Usa un código de 3 letras, como USD o BOB.' }),
	duracion_dias: z
		.number({ message: 'Ingresa los días que dura.' })
		.int({ message: 'Usa días enteros.' })
		.min(1, { message: 'Dura al menos un día.' })
		.max(32767, { message: 'Son demasiados días.' }),
	is_visible: z.boolean()
});
