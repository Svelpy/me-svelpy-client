<!--
	El enlace de verificación del correo (`?token=`). Verifica en cuanto se abre; si hay sesión en
	este navegador, la actualiza y dice qué le falta a la tarjeta para publicarse.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { PantallaAuth } from '#lib/components/features/auth/index.ts';
	import { Button } from '#lib/components/ui/index.ts';
	import { bloqueoPublicacion } from '#lib/config/planes.config.ts';
	import { CircleCheckIcon, LoaderIcon } from '#lib/icons/outline/index.ts';
	import { authService, errorService } from '#lib/services/index.ts';
	import { authStore, currentRole, currentUserStore } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { getHomeRoute } from '#lib/utils/rbac.utils.ts';
	import { resolveStaticRoute } from '#lib/utils/resolveRoute.ts';
	import { DOMINIO_PUBLICO } from '#lib/utils/urlPublica.ts';

	type Estado = 'verificando' | 'listo' | 'error' | 'sin-token';

	let estado = $state<Estado>('verificando');
	let error = $state('');
	let reenviando = $state(false);

	const conSesion = $derived(!!$currentUserStore && !!authService.getToken());
	const inicio = $derived($currentRole ? resolveStaticRoute(getHomeRoute($currentRole)) : null);
	const tarjeta = $derived($currentUserStore?.tarjeta ?? null);
	const bloqueo = $derived($currentUserStore ? bloqueoPublicacion($currentUserStore.user) : null);

	onMount(async () => {
		const token = page.url.searchParams.get('token')?.trim();
		if (!token) {
			estado = 'sin-token';
			return;
		}
		try {
			await authService.verificarEmail(token);
			estado = 'listo';
			// La sesión abierta pasa a "verificado" sin tener que volver a entrar
			if (authService.getToken()) await authStore.refreshUser().catch(() => null);
		} catch (causa) {
			// El mismo enlace abierto otra vez (recarga, otra pestaña, otro navegador): el token ya se
			// usó, pero si la cuenta de esta sesión quedó verificada eso es lo que hay que decir
			if (await yaVerificado()) {
				estado = 'listo';
				return;
			}
			error = errorService.getMessage(causa);
			estado = 'error';
		}
	});

	async function yaVerificado(): Promise<boolean> {
		if (!authService.getToken()) return false;
		const sesion = await authStore.refreshUser().catch(() => null);
		return !!sesion?.user.email_verified_at;
	}

	async function reenviar() {
		reenviando = true;
		try {
			await authService.reenviarVerificacion();
			alert('success', `Enlace enviado a ${$currentUserStore?.user.email ?? 'tu correo'}`);
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			reenviando = false;
		}
	}

	const enlace =
		'font-semibold text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:text-dark-two dark:decoration-dark-four dark:hover:decoration-dark-two';
</script>

{#if estado === 'verificando'}
	<PantallaAuth pestana="Verificando tu correo" titulo="Verificando tu correo…">
		<p
			class="flex items-center gap-2 text-[0.9375rem] text-light-two_d dark:text-dark-two_d"
			role="status"
		>
			<LoaderIcon class="size-5 animate-spin motion-reduce:animate-none" />
			Un momento.
		</p>
	</PantallaAuth>
{:else if estado === 'listo'}
	<PantallaAuth pestana="Correo verificado" titulo="Tu correo quedó verificado">
		<div class="space-y-6">
			<p class="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed">
				<CircleCheckIcon class="mt-0.5 size-5 shrink-0 text-light-success dark:text-dark-success" />
				{#if tarjeta && !bloqueo}
					<span>Ya puedes publicar tu tarjeta y compartirla con quien quieras.</span>
				{:else if tarjeta && (bloqueo === 'plan-free' || bloqueo === 'plan-vencido')}
					<span>Te queda un paso para publicar tu tarjeta: activar el plan Pro.</span>
				{:else}
					<span>Te avisaremos a este correo lo importante de tu cuenta.</span>
				{/if}
			</p>
			{#if tarjeta}
				<!-- Lo que queda a un paso: el enlace que van a abrir sus clientes -->
				<p
					class="rounded-xl bg-light-one_d px-4 py-3 font-mono text-[0.9375rem] [overflow-wrap:anywhere] dark:bg-dark-one_d"
				>
					{DOMINIO_PUBLICO}/<span class="font-semibold">{tarjeta.slug}</span>
				</p>
			{/if}
			{#if conSesion && inicio}
				<Button href={inicio} variant="accent" size="lg" fullWidth>
					{tarjeta ? 'Ir a mi tarjeta' : 'Ir al panel'}
				</Button>
			{:else}
				<Button href={resolve('/auth/sign-in')} variant="accent" size="lg" fullWidth>
					Iniciar sesión
				</Button>
			{/if}
		</div>
	</PantallaAuth>
{:else if estado === 'sin-token'}
	<PantallaAuth
		pestana="Enlace incompleto"
		titulo="Este enlace no está completo"
		descripcion="Ábrelo directo desde el correo, sin copiar una parte."
	>
		{#if conSesion}
			<Button variant="accent" size="lg" fullWidth loading={reenviando} onclick={reenviar}>
				Enviar un enlace nuevo
			</Button>
		{:else}
			<Button href={resolve('/auth/sign-in')} variant="accent" size="lg" fullWidth>
				Iniciar sesión para pedir otro
			</Button>
		{/if}
	</PantallaAuth>
{:else}
	<PantallaAuth
		pestana="No se pudo verificar"
		titulo="No pudimos verificar tu correo"
		descripcion={error}
	>
		<div class="space-y-4">
			<p class="text-sm text-light-two_d dark:text-dark-two_d">
				Cada enlace sirve una sola vez y deja de valer cuando pides otro. Usa el último que te llegó
				o pide uno nuevo.
			</p>
			{#if conSesion}
				<Button variant="accent" size="lg" fullWidth loading={reenviando} onclick={reenviar}>
					Enviar un enlace nuevo
				</Button>
			{:else}
				<p class="text-sm text-light-two_d dark:text-dark-two_d">
					¿Ya lo habías abierto? Entonces tu correo ya quedó verificado: inicia sesión y lo verás en
					tu cuenta.
				</p>
				<Button href={resolve('/auth/sign-in')} variant="accent" size="lg" fullWidth>
					Iniciar sesión
				</Button>
			{/if}
		</div>
		{#snippet pie()}
			{#if conSesion && inicio}
				<p><a href={inicio} class={enlace}>Volver al panel</a></p>
			{/if}
		{/snippet}
	</PantallaAuth>
{/if}
