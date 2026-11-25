import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { cuentaDePrueba } from '../tarjeta/tarjetaDePrueba.ts';
import AvisoPublicacion from './avisoPublicacion.svelte';

describe('AvisoPublicacion', () => {
	it('al user Free le ofrece activar Pro por WhatsApp', async () => {
		const screen = await render(AvisoPublicacion, {
			bloqueo: 'plan-free',
			modo: 'user',
			cuenta: cuentaDePrueba(),
			slug: 'doctora-prueba'
		});
		await expect.element(screen.getByText('Publicar es parte del plan Pro')).toBeVisible();
		await expect
			.element(screen.getByRole('link', { name: 'Activar Pro' }))
			.toHaveAttribute('href', expect.stringContaining('wa.me'));
	});

	it('al admin le ofrece registrar el pago de esa cuenta', async () => {
		const screen = await render(AvisoPublicacion, {
			bloqueo: 'plan-vencido',
			modo: 'admin',
			cuenta: cuentaDePrueba({ plan_vence_at: '2020-01-01T00:00:00.000Z' })
		});
		await expect.element(screen.getByText('El plan de esta cuenta venció')).toBeVisible();
		await expect
			.element(screen.getByRole('link', { name: 'Registrar pago' }))
			.toHaveAttribute('href', '/panel/pagos/nuevo?usuario=usuario-1');
	});

	it('sin el correo verificado, el user puede pedir otro enlace', async () => {
		const screen = await render(AvisoPublicacion, {
			bloqueo: 'email-sin-verificar',
			modo: 'user',
			cuenta: cuentaDePrueba({ email_verified_at: null })
		});
		await expect.element(screen.getByText('Verifica tu correo para publicar')).toBeVisible();
		await expect.element(screen.getByText(/lucia@prueba\.test/)).toBeVisible();
		await expect.element(screen.getByRole('button', { name: 'Reenviar enlace' })).toBeVisible();
	});

	it('el admin no puede verificar por la persona: solo se le explica', async () => {
		const screen = await render(AvisoPublicacion, {
			bloqueo: 'email-sin-verificar',
			modo: 'admin',
			cuenta: cuentaDePrueba({ email_verified_at: null })
		});
		await expect.element(screen.getByText('Su correo aún no está verificado')).toBeVisible();
		await expect.element(screen.getByRole('button')).not.toBeInTheDocument();
	});
});
