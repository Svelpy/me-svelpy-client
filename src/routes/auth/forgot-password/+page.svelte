<!--
	Pedir el enlace para crear una contraseña nueva. La respuesta es la misma exista o no la cuenta
	(así nadie averigua qué correos están registrados), y la pantalla lo dice tal cual.
-->
<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { PantallaAuth } from '#lib/components/features/auth/index.ts';
	import { AlertBox, Button, Input } from '#lib/components/ui/index.ts';
	import { MailIcon } from '#lib/icons/outline/index.ts';
	import { authService, errorService } from '#lib/services/index.ts';
	import { validateSchema } from '#lib/utils/validateSchema.ts';
	import { olvidePasswordSchema } from '#lib/zod/auth.schema.ts';

	/** Segundos antes de poder pedir otro enlace (la API limita los intentos seguidos) */
	const ESPERA = 30;

	let email = $state(untrack(() => page.url.searchParams.get('email') ?? ''));
	let enviadoA = $state<string | null>(null);
	let enviando = $state(false);
	let error = $state('');
	let errorEmail = $state('');
	let restante = $state(0);
	let reloj: ReturnType<typeof setInterval> | undefined;

	function esperar() {
		restante = ESPERA;
		clearInterval(reloj);
		reloj = setInterval(() => {
			restante -= 1;
			if (restante <= 0) clearInterval(reloj);
		}, 1000);
	}
	onDestroy(() => clearInterval(reloj));

	async function pedir(destino: string) {
		enviando = true;
		error = '';
		try {
			await authService.olvidePassword(destino);
			enviadoA = destino;
			esperar();
		} catch (causa) {
			error = errorService.getMessage(causa);
		} finally {
			enviando = false;
		}
	}

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		const resultado = validateSchema(olvidePasswordSchema, { email });
		if (!resultado.success) {
			errorEmail = resultado.errors.email ?? '';
			return;
		}
		errorEmail = '';
		pedir(resultado.data.email);
	}

	const enlace =
		'font-semibold text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:text-dark-two dark:decoration-dark-four dark:hover:decoration-dark-two';
</script>

{#if enviadoA}
	<PantallaAuth pestana="Revisa tu correo" titulo="Revisa tu correo">
		<div class="space-y-5">
			<p class="text-[0.9375rem] leading-relaxed">
				Si hay una cuenta con <span class="font-semibold break-all">{enviadoA}</span>, te llegó un
				enlace para crear una contraseña nueva. Sirve una sola vez y vence pronto.
			</p>
			<p class="text-sm text-light-two_d dark:text-dark-two_d">
				¿No aparece? Busca en spam o en promociones.
			</p>
			{#if error}<AlertBox variant="error">{error}</AlertBox>{/if}
			<Button
				variant="secondary"
				fullWidth
				loading={enviando}
				disabled={restante > 0}
				onclick={() => enviadoA && pedir(enviadoA)}
			>
				{restante > 0 ? `Enviar otra vez en ${restante} s` : 'Enviar otra vez'}
			</Button>
		</div>
		{#snippet pie()}
			<p>
				<button type="button" class={enlace} onclick={() => (enviadoA = null)}>
					Usar otro correo
				</button>
			</p>
			<p><a href={resolve('/auth/sign-in')} class={enlace}>Volver a iniciar sesión</a></p>
		{/snippet}
	</PantallaAuth>
{:else}
	<PantallaAuth
		pestana="Recuperar tu contraseña"
		titulo="Recupera tu contraseña"
		descripcion="Escribe el correo con el que entras y te enviaremos un enlace para crear una nueva."
	>
		<form onsubmit={enviar} novalidate class="space-y-5">
			{#if error}<AlertBox variant="error">{error}</AlertBox>{/if}
			<Input
				label="Correo"
				type="email"
				autocomplete="email"
				inputmode="email"
				icon={MailIcon}
				placeholder="tu@correo.com"
				bind:value={email}
				error={errorEmail}
				disabled={enviando}
			/>
			<Button type="submit" variant="accent" size="lg" fullWidth loading={enviando}>
				Enviar enlace
			</Button>
		</form>
		{#snippet pie()}
			<p>
				¿Te acordaste?
				<a href={resolve('/auth/sign-in')} class={enlace}>Inicia sesión</a>
			</p>
		{/snippet}
	</PantallaAuth>
{/if}
