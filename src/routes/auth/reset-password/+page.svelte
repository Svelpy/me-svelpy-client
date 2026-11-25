<!--
	Crear la contraseña nueva con el enlace del correo (`?token=`). El token sirve una vez y cierra
	todas las sesiones abiertas, así que después se vuelve a entrar con la nueva.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { PantallaAuth } from '#lib/components/features/auth/index.ts';
	import { AlertBox, Button, Input } from '#lib/components/ui/index.ts';
	import { EyeIcon, EyeOffIcon, LockIcon } from '#lib/icons/outline/index.ts';
	import { authService, errorService } from '#lib/services/index.ts';
	import { authStore } from '#lib/stores/index.ts';
	import { signInUrl } from '#lib/utils/signInReason.ts';
	import { validateSchema } from '#lib/utils/validateSchema.ts';
	import { restablecerPasswordSchema } from '#lib/zod/auth.schema.ts';

	const token = $derived(page.url.searchParams.get('token')?.trim() ?? '');

	let nueva = $state('');
	let confirmar = $state('');
	let mostrar = $state(false);
	let enviando = $state(false);
	let errores = $state<Record<string, string>>({});
	let error = $state('');

	async function enviar(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		const resultado = validateSchema(restablecerPasswordSchema, { new_password: nueva, confirmar });
		if (!resultado.success) {
			errores = resultado.errors;
			return;
		}
		errores = {};
		enviando = true;
		try {
			await authService.restablecerPassword(token, resultado.data.new_password);
			// La API cerró todas las sesiones: también la de este navegador, si había una
			await authStore.logout();
			await goto(signInUrl({ reason: 'password' }), { replace: true });
		} catch (causa) {
			const campos = errorService.getFieldErrors(causa);
			errores = { new_password: campos.new_password ?? '' };
			// Un token vencido o usado llega como error del formulario, no de un campo
			error = campos.new_password ? '' : errorService.getMessage(causa);
		} finally {
			enviando = false;
		}
	}

	const enlace =
		'font-semibold text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:text-dark-two dark:decoration-dark-four dark:hover:decoration-dark-two';
</script>

{#if !token}
	<PantallaAuth
		pestana="Enlace incompleto"
		titulo="Este enlace no está completo"
		descripcion="Ábrelo directo desde el correo, sin copiar una parte. Si sigue igual, pide uno nuevo."
	>
		<Button href={resolve('/auth/forgot-password')} variant="accent" size="lg" fullWidth>
			Pedir un enlace nuevo
		</Button>
	</PantallaAuth>
{:else}
	<PantallaAuth
		pestana="Crear contraseña nueva"
		titulo="Crea tu contraseña nueva"
		descripcion="Al guardarla se cierran las sesiones abiertas y vuelves a entrar con ella."
	>
		<form onsubmit={enviar} novalidate class="space-y-5">
			{#if error}
				<AlertBox variant="error" title={error}>
					Los enlaces sirven una sola vez y vencen pronto.
					{#snippet accion()}
						<Button href={resolve('/auth/forgot-password')} variant="secondary" size="sm">
							Pedir otro
						</Button>
					{/snippet}
				</AlertBox>
			{/if}
			<Input
				label="Contraseña nueva"
				type={mostrar ? 'text' : 'password'}
				autocomplete="new-password"
				icon={LockIcon}
				hint="Al menos 8 caracteres, con una letra y un número."
				bind:value={nueva}
				error={errores.new_password}
				disabled={enviando}
			>
				{#snippet trailing()}
					<button
						type="button"
						onclick={() => (mostrar = !mostrar)}
						aria-label={mostrar ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
						aria-pressed={mostrar}
						class="grid size-9 place-items-center rounded-lg text-light-two_d transition-colors hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three"
					>
						{#if mostrar}<EyeOffIcon />{:else}<EyeIcon />{/if}
					</button>
				{/snippet}
			</Input>
			<Input
				label="Repite la contraseña"
				type={mostrar ? 'text' : 'password'}
				autocomplete="new-password"
				icon={LockIcon}
				bind:value={confirmar}
				error={errores.confirmar}
				disabled={enviando}
			/>
			<Button type="submit" variant="accent" size="lg" fullWidth loading={enviando}>
				Guardar contraseña
			</Button>
		</form>
		{#snippet pie()}
			<p><a href={resolve('/auth/sign-in')} class={enlace}>Volver a iniciar sesión</a></p>
		{/snippet}
	</PantallaAuth>
{/if}
