<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { EstadoFormulario } from '#lib/components/features/editor/index.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { AlertBox, Button, Input, PageHeader } from '#lib/components/ui/index.ts';
	import { APP_SITE_CONFIG, ROLE_LABEL } from '#lib/constants/index.ts';
	import { authService } from '#lib/services/index.ts';
	import { authStore, currentRole, currentUserStore } from '#lib/stores/index.ts';
	import { whatsappUrl } from '#lib/utils/contacto.ts';
	import { signInUrl } from '#lib/utils/signInReason.ts';
	import { cambiarPasswordSchema } from '#lib/zod/auth.schema.ts';

	const usuario = $derived($currentUserStore?.user);
	const tarjeta = $derived($currentUserStore?.tarjeta ?? null);

	let actual = $state('');
	let nueva = $state('');
	let confirmar = $state('');
	const estado = new EstadoFormulario();

	/** Al cambiarla se vuelve a entrar con la nueva: así queda comprobada */
	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(
			cambiarPasswordSchema,
			{ password_actual: actual, password_nueva: nueva, confirmar },
			async ({ password_actual, password_nueva }) => {
				await authService.cambiarPassword({ password_actual, password_nueva });
				await authStore.logout();
				await goto(signInUrl({ reason: 'password' }), { replace: true });
			}
		);
	}

	const soporteEmail = whatsappUrl(
		APP_SITE_CONFIG.SOPORTE_WHATSAPP,
		'Hola, quiero cambiar el correo de mi cuenta de ME.'
	);
</script>

<MainLayout title="Mi cuenta | Panel ME" noIndex>
	<div class="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
		<PageHeader title="Mi cuenta" description="Tus datos de acceso al panel." />

		<dl
			class="mt-8 divide-y divide-light-four/40 rounded-2xl border border-light-four/40 text-sm dark:divide-dark-one_d dark:border-dark-one_d"
		>
			<div class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between">
				<dt class="text-light-two_d dark:text-dark-two_d">Correo</dt>
				<dd class="font-medium">{usuario?.email}</dd>
			</div>
			<div class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between">
				<dt class="text-light-two_d dark:text-dark-two_d">Rol</dt>
				<dd class="font-medium">{$currentRole ? ROLE_LABEL[$currentRole] : ''}</dd>
			</div>
			{#if tarjeta}
				<div class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between">
					<dt class="text-light-two_d dark:text-dark-two_d">Tarjeta</dt>
					<dd>
						<a
							href={resolve('/panel/mi-tarjeta')}
							class="font-medium underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:decoration-dark-four"
						>
							Editar mi tarjeta
						</a>
					</dd>
				</div>
			{/if}
		</dl>
		<p class="mt-3 text-sm text-light-two_d dark:text-dark-two_d">
			¿Necesitas cambiar tu correo?
			<a
				href={soporteEmail}
				target="_blank"
				rel="external noopener noreferrer"
				class="font-semibold text-light-two underline decoration-light-four underline-offset-4 dark:text-dark-two"
			>
				Escríbenos por WhatsApp
			</a>
		</p>

		<section aria-labelledby="password-titulo" class="mt-12">
			<h2 id="password-titulo" class="font-display text-lg font-semibold">Cambiar contraseña</h2>
			<p class="mt-1 text-sm text-light-two_d dark:text-dark-two_d">
				Se cierran tus otras sesiones y vuelves a entrar con la nueva.
			</p>
			<form onsubmit={enviar} novalidate class="mt-6 space-y-5">
				{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
				<Input
					label="Contraseña actual"
					type="password"
					autocomplete="current-password"
					required
					bind:value={actual}
					error={estado.errores.password_actual}
				/>
				<Input
					label="Contraseña nueva"
					type="password"
					autocomplete="new-password"
					required
					hint="Al menos 8 caracteres, con letras y números."
					bind:value={nueva}
					error={estado.errores.password_nueva}
				/>
				<Input
					label="Repite la contraseña nueva"
					type="password"
					autocomplete="new-password"
					required
					bind:value={confirmar}
					error={estado.errores.confirmar}
				/>
				<div class="flex justify-end">
					<Button type="submit" loading={estado.enviando}>Cambiar contraseña</Button>
				</div>
			</form>
		</section>
	</div>
</MainLayout>
