<script lang="ts">
	import { goto } from '$app/navigation';
	import { match, resolve } from '$app/paths';
	import { page } from '$app/state';
	import { AlertBox, Button, Input } from '#lib/components/ui/index.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { LOGOS_ME } from '#lib/constants/index.ts';
	import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from '#lib/icons/outline/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { authStore, currentRole } from '#lib/stores/index.ts';
	import {
		canAccessRoute,
		getHomeRoute,
		isSafeRedirect,
		isSignInReason,
		resolveStaticRoute,
		SIGN_IN_REASON_MESSAGES,
		SIGN_IN_REASON_PARAM,
		validateSchema
	} from '#lib/utils/index.ts';
	import { rutaConQuery } from '#lib/utils/resolveRoute.ts';
	import { signInSchema } from '#lib/zod/auth.schema.ts';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let isLoading = $state(false);
	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');

	// Por qué se llegó aquí (sesión vencida, página protegida, contraseña nueva); solo motivos conocidos
	const reason = $derived.by(() => {
		const value = page.url.searchParams.get(SIGN_IN_REASON_PARAM);
		return isSignInReason(value) ? value : null;
	});

	// Recuperar la contraseña con el correo ya escrito
	const recuperarUrl = $derived(
		rutaConQuery(resolve('/auth/forgot-password'), { email: email.trim() })
	);

	// Vuelve a la página pedida antes del login solo si es interna y el rol puede abrirla;
	// si no, a la página de inicio del rol
	async function getRedirectAfterLogin(): Promise<string | null> {
		const role = $currentRole;
		if (!role) return null;

		const redirectTo = page.url.searchParams.get('redirectTo');
		if (isSafeRedirect(redirectTo)) {
			const target = await match(redirectTo);
			if (target && canAccessRoute(role, target.id)) return redirectTo;
		}
		return resolveStaticRoute(getHomeRoute(role));
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		formError = '';

		const result = validateSchema(signInSchema, { email, password });
		if (!result.success) {
			fieldErrors = result.errors;
			return;
		}
		fieldErrors = {};

		isLoading = true;
		try {
			await authStore.login(result.data);
			const destination = await getRedirectAfterLogin();
			if (!destination) {
				// Rol que el frontend no conoce: sin páginas a las que entrar
				await authStore.logout();
				formError = 'Tu cuenta no tiene acceso a este panel.';
				return;
			}
			// destination ya viene resuelto (resolve() o una URL interna validada con isSafeRedirect)
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(destination, { replace: true });
		} catch (error) {
			formError = errorService.getMessage(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<MainLayout title="Iniciar sesión | ME" noIndex canonicalUrl="/auth/sign-in">
	<main class="mx-auto flex min-h-dvh w-full max-w-[25rem] flex-col justify-center px-5 py-16">
		<a
			href={resolve('/')}
			class="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-light-three dark:focus-visible:outline-dark-three"
		>
			<img
				src={LOGOS_ME.isotipoClaro}
				alt="ME, ir a la página principal"
				width="54"
				height="32"
				class="h-8 w-auto dark:hidden"
			/>
			<img
				src={LOGOS_ME.isotipoOscuro}
				alt="ME, ir a la página principal"
				width="54"
				height="32"
				class="hidden h-8 w-auto dark:block"
			/>
		</a>

		<h1 class="mt-10 font-display text-[2rem] leading-tight font-semibold tracking-[-0.015em]">
			Entra a tu panel
		</h1>
		<p class="mt-2 text-[0.9375rem] text-light-two_d dark:text-dark-two_d">
			Edita tu tarjeta y mira cada cambio antes de publicarlo.
		</p>

		<form onsubmit={handleSubmit} novalidate class="mt-8 space-y-5">
			{#if reason && !formError}
				<!-- Cambiar la contraseña no es un problema: se informa, no se advierte -->
				<AlertBox variant={reason === 'password' ? 'success' : 'warning'}>
					{SIGN_IN_REASON_MESSAGES[reason]}
				</AlertBox>
			{/if}
			{#if formError}
				<AlertBox variant="error">{formError}</AlertBox>
			{/if}

			<Input
				label="Correo"
				type="email"
				autocomplete="email"
				inputmode="email"
				icon={MailIcon}
				bind:value={email}
				error={fieldErrors.email}
				disabled={isLoading}
				placeholder="tu@correo.com"
			/>
			<Input
				label="Contraseña"
				type={showPassword ? 'text' : 'password'}
				autocomplete="current-password"
				icon={LockIcon}
				bind:value={password}
				error={fieldErrors.password}
				disabled={isLoading}
			>
				{#snippet trailing()}
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
						aria-pressed={showPassword}
						class="grid size-9 place-items-center rounded-lg text-light-two_d transition-colors hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three"
						disabled={isLoading}
					>
						{#if showPassword}<EyeOffIcon />{:else}<EyeIcon />{/if}
					</button>
				{/snippet}
			</Input>

			<Button type="submit" variant="accent" size="lg" fullWidth loading={isLoading}>
				Ingresar
			</Button>
		</form>

		<p class="mt-5 text-sm text-light-two_d dark:text-dark-two_d">
			¿Olvidaste tu contraseña?
			<a
				href={recuperarUrl}
				class="font-semibold text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:text-dark-two dark:decoration-dark-four dark:hover:decoration-dark-two"
			>
				Te enviamos un enlace
			</a>
		</p>
		<p class="mt-2 text-sm text-light-two_d dark:text-dark-two_d">
			¿Aún no tienes cuenta?
			<a
				href={resolve('/auth/sign-up')}
				class="font-semibold text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:text-dark-two dark:decoration-dark-four dark:hover:decoration-dark-two"
			>
				Crea tu tarjeta
			</a>
		</p>
	</main>
</MainLayout>
