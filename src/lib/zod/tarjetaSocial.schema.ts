import { z } from 'zod';
import { RED_SOCIAL_LABEL } from '#lib/constants/data.ts';
import type { RedSocial } from '#lib/interfaces/index.ts';
import { booleanoOpcional, textoOpcional, urlHttps } from './common';

const REDES = Object.keys(RED_SOCIAL_LABEL) as [RedSocial, ...RedSocial[]];

export const tarjetaSocialSchema = z.object({
	red: z.enum(REDES, { message: 'Elige la red.' }),
	url: urlHttps('El enlace'),
	username: textoOpcional('El usuario', 100).transform(
		(usuario) => usuario?.replace(/^@/, '') || null
	),
	is_visible: booleanoOpcional()
});
