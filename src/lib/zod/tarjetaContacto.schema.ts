import { z } from 'zod';
import { booleanoOpcional, esEmail, texto, textoOpcional } from './common';

const TELEFONO = /^\+?[\d\s()-]{6,20}$/;
const SITIO = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i;

export const CONTACTO_TIPOS = ['phone', 'email', 'website'] as const;

export const tarjetaContactoSchema = z
	.object({
		tipo: z.enum(CONTACTO_TIPOS, { message: 'Elige el tipo de contacto.' }),
		valor: texto('El dato de contacto', 255),
		etiqueta: textoOpcional('La etiqueta', 60),
		is_wpp: booleanoOpcional(),
		is_primary: booleanoOpcional(),
		is_visible: booleanoOpcional()
	})
	.superRefine((contacto, ctx) => {
		const invalido = (message: string) =>
			ctx.addIssue({ code: 'custom', path: ['valor'], message });
		if (contacto.tipo === 'phone') {
			const digitos = contacto.valor.replace(/\D/g, '').length;
			if (!TELEFONO.test(contacto.valor) || digitos < 6) {
				invalido('Ingresa un número válido: solo números, espacios, + y guiones.');
			}
		}
		if (contacto.tipo === 'email' && !esEmail(contacto.valor)) {
			invalido('Ingresa un correo válido, como nombre@dominio.com.');
		}
		if (contacto.tipo === 'website' && !SITIO.test(contacto.valor)) {
			invalido('Ingresa una dirección web válida, como www.misitio.com.');
		}
		if (contacto.tipo !== 'phone' && contacto.is_wpp) {
			ctx.addIssue({
				code: 'custom',
				path: ['is_wpp'],
				message: 'Solo un teléfono puede tener WhatsApp.'
			});
		}
	});
