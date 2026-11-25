<!--
	Por qué una tarjeta no se puede publicar todavía, con la única acción que lo resuelve. El user ve
	su camino (WhatsApp para el plan, reenviar el enlace del correo); el admin, el suyo (registrar
	un pago, ver la cuenta).
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { AlertBox, Button } from '#lib/components/ui/index.ts';
	import type { BloqueoPublicacion, CuentaPublicadora } from '#lib/config/planes.config.ts';
	import { authService, errorService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { formatVencimiento, urlActivarPro } from '#lib/utils/plan.ts';
	import { rutaConQuery } from '#lib/utils/resolveRoute.ts';

	interface Props {
		bloqueo: BloqueoPublicacion;
		modo: 'user' | 'admin';
		cuenta: CuentaPublicadora & { id: string; email: string };
		/** Para el mensaje de WhatsApp */
		slug?: string;
		class?: string;
	}

	let { bloqueo, modo, cuenta, slug, class: className }: Props = $props();

	let reenviando = $state(false);

	async function reenviar() {
		reenviando = true;
		try {
			await authService.reenviarVerificacion();
			alert('success', `Enlace enviado a ${cuenta.email}`);
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			reenviando = false;
		}
	}

	const registrarPago = $derived(
		rutaConQuery(resolve('/panel/pagos/nuevo'), { usuario: cuenta.id })
	);

	const texto = $derived.by(() => {
		const usuario = modo === 'user';
		switch (bloqueo) {
			case 'plan-free':
				return usuario
					? {
							titulo: 'Publicar es parte del plan Pro',
							detalle: 'Arma toda tu tarjeta con Free; actívalo cuando quieras que otros la vean.'
						}
					: {
							titulo: 'Esta cuenta tiene el plan Free',
							detalle: 'Registra el pago de un plan para poder publicar su tarjeta.'
						};
			case 'plan-vencido':
				return usuario
					? {
							titulo: 'Tu plan venció',
							detalle: `Venció el ${formatVencimiento(cuenta.plan_vence_at)}. Renuévalo para volver a publicar.`
						}
					: {
							titulo: 'El plan de esta cuenta venció',
							detalle: `Venció el ${formatVencimiento(cuenta.plan_vence_at)}. Registra un pago para renovarlo.`
						};
			case 'email-sin-verificar':
				return usuario
					? {
							titulo: 'Verifica tu correo para publicar',
							detalle: `Abre el enlace que te enviamos a ${cuenta.email}.`
						}
					: {
							titulo: 'Su correo aún no está verificado',
							detalle: `Podrá publicar cuando abra el enlace que le enviamos a ${cuenta.email}.`
						};
			case 'cuenta-de-baja':
				return {
					titulo: 'La cuenta está dada de baja',
					detalle: 'Reactívala para que su tarjeta se pueda volver a publicar.'
				};
		}
	});
</script>

<AlertBox
	variant={bloqueo === 'plan-vencido' || bloqueo === 'cuenta-de-baja' ? 'warning' : 'info'}
	title={texto.titulo}
	class={className}
>
	{texto.detalle}
	{#snippet accion()}
		{#if modo === 'user' && (bloqueo === 'plan-free' || bloqueo === 'plan-vencido')}
			<Button
				variant="secondary"
				size="sm"
				href={urlActivarPro(slug, bloqueo === 'plan-vencido')}
				target="_blank"
				rel="external noopener noreferrer"
			>
				{bloqueo === 'plan-free' ? 'Activar Pro' : 'Renovar Pro'}
			</Button>
		{:else if modo === 'user' && bloqueo === 'email-sin-verificar'}
			<Button variant="secondary" size="sm" loading={reenviando} onclick={reenviar}>
				Reenviar enlace
			</Button>
		{:else if modo === 'admin' && (bloqueo === 'plan-free' || bloqueo === 'plan-vencido')}
			<Button variant="secondary" size="sm" href={registrarPago}>Registrar pago</Button>
		{:else if modo === 'admin' && bloqueo === 'cuenta-de-baja'}
			<Button
				variant="secondary"
				size="sm"
				href={resolve('/panel/usuarios/[id]', { id: cuenta.id })}
			>
				Ver la cuenta
			</Button>
		{/if}
	{/snippet}
</AlertBox>
