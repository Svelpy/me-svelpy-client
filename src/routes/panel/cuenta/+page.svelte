<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { EstadoFormulario } from '#lib/components/features/editor/index.ts';
	import { EstadoPlan } from '#lib/components/features/planes/index.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { AlertBox, Button, Input, PageHeader } from '#lib/components/ui/index.ts';
	import { Role } from '#lib/config/permissions.config.ts';
	import { estadoPlan, PLAN_PRO } from '#lib/config/planes.config.ts';
	import { ROLE_LABEL } from '#lib/constants/index.ts';
	import type { PlanPublico } from '#lib/interfaces/index.ts';
	import {
		AppError,
		authService,
		errorService,
		planService,
		usuarioService
	} from '#lib/services/index.ts';
	import { authStore, currentRole, currentUserStore } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { formatDuracion, formatearMonto, urlActivarPro } from '#lib/utils/plan.ts';
	import { cambiarPasswordSchema } from '#lib/zod/auth.schema.ts';
	import { usuarioUpdateMeSchema } from '#lib/zod/usuario.schema.ts';

	const usuario = $derived($currentUserStore?.user);
	const tarjeta = $derived($currentUserStore?.tarjeta ?? null);
	const esUser = $derived($currentRole === Role.USER);

	// El precio del Pro, para decir cuánto cuesta lo que se ofrece activar
	let pro = $state<PlanPublico | null>(null);
	onMount(async () => {
		if (!esUser) return;
		try {
			pro = (await planService.publicos()).find((plan) => plan.codigo === PLAN_PRO) ?? null;
		} catch {
			// Sin precio igual se puede escribir por WhatsApp
		}
	});

	// Free se activa; un plan pago vencido o por vencer se renueva
	const accionPlan = $derived.by(() => {
		if (!usuario) return null;
		const estado = estadoPlan(usuario);
		if (estado.tipo === 'vigente' && !estado.vencePronto) return null;
		const renovar = estado.tipo !== 'free';
		return {
			href: urlActivarPro(tarjeta?.slug, renovar),
			texto: renovar ? 'Renovar por WhatsApp' : 'Activar Pro'
		};
	});

	// Correo
	let editandoEmail = $state(false);
	let email = $state('');
	const formEmail = new EstadoFormulario();

	function abrirEmail() {
		email = usuario?.email ?? '';
		formEmail.limpiar();
		editandoEmail = true;
	}

	function guardarEmail(event: SubmitEvent) {
		event.preventDefault();
		formEmail.enviar(usuarioUpdateMeSchema, { email }, async (validos) => {
			if (validos.email === usuario?.email) {
				editandoEmail = false;
				return;
			}
			const actualizado = await usuarioService.actualizarMe(validos);
			authStore.setUserData(actualizado);
			editandoEmail = false;
			alert(
				'success',
				`Correo cambiado. Te enviamos un enlace a ${actualizado.email} para verificarlo.`
			);
		});
	}

	let reenviando = $state(false);
	async function reenviar() {
		reenviando = true;
		try {
			await authService.reenviarVerificacion();
			alert('success', `Enlace enviado a ${usuario?.email}`);
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			reenviando = false;
		}
	}

	// Contraseña
	let actual = $state('');
	let nueva = $state('');
	let confirmar = $state('');
	const estado = new EstadoFormulario();

	/** La sesión sigue abierta en este dispositivo: la API devuelve tokens nuevos */
	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(
			cambiarPasswordSchema,
			{ current_password: actual, new_password: nueva, confirmar },
			async ({ current_password, new_password }) => {
				try {
					await authService.cambiarPassword({ current_password, new_password });
				} catch (causa) {
					// 401 aquí es la contraseña actual: se marca en su campo
					if (causa instanceof AppError && causa.status === 401) {
						throw new AppError({
							message: 'La contraseña actual no es correcta.',
							code: causa.code,
							status: 401,
							details: { current_password: 'La contraseña actual no es correcta.' }
						});
					}
					throw causa;
				}
				actual = nueva = confirmar = '';
				alert('success', 'Contraseña cambiada. Cerramos tus otras sesiones.');
			}
		);
	}

	const fila = 'flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between';
	const enlace =
		'font-semibold underline decoration-light-four underline-offset-4 hover:decoration-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:decoration-dark-four dark:hover:decoration-dark-two dark:focus-visible:outline-dark-three';
</script>

<MainLayout title="Mi cuenta | Panel ME" noIndex>
	<div class="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-10">
		<PageHeader title="Mi cuenta" description="Tus datos de acceso al panel." />

		<dl
			class="mt-8 divide-y divide-light-four/40 rounded-2xl border border-light-four/40 text-sm dark:divide-dark-one_d dark:border-dark-one_d"
		>
			<div class={fila}>
				<dt class="text-light-two_d dark:text-dark-two_d">Correo</dt>
				<dd class="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
					<span class="font-medium break-all">{usuario?.email}</span>
					{#if !editandoEmail}
						<button type="button" class={enlace} onclick={abrirEmail}>Cambiar</button>
					{/if}
				</dd>
			</div>
			{#if editandoEmail}
				<form onsubmit={guardarEmail} novalidate class="space-y-4 px-4 py-4">
					{#if formEmail.error && !formEmail.errores.email}
						<AlertBox variant="error">{formEmail.error}</AlertBox>
					{/if}
					<Input
						label="Correo nuevo"
						type="email"
						autocomplete="email"
						inputmode="email"
						required
						hint="Te enviaremos un enlace para verificarlo. Hasta entonces no podrás publicar."
						bind:value={email}
						error={formEmail.errores.email}
					/>
					<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<Button variant="secondary" onclick={() => (editandoEmail = false)}>Cancelar</Button>
						<Button type="submit" loading={formEmail.enviando}>Guardar correo</Button>
					</div>
				</form>
			{/if}
			<div class={fila}>
				<dt class="text-light-two_d dark:text-dark-two_d">Verificación</dt>
				<dd class="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
					{#if usuario?.email_verified_at}
						<span class="text-light-two_d dark:text-dark-two_d">Correo verificado</span>
					{:else}
						<span class="inline-flex items-center gap-1.5 font-medium">
							<span
								class="size-1.5 rounded-full bg-light-warning dark:bg-dark-warning"
								aria-hidden="true"
							></span>
							Sin verificar
						</span>
						<button type="button" class={enlace} disabled={reenviando} onclick={reenviar}>
							{reenviando ? 'Enviando…' : 'Reenviar enlace'}
						</button>
					{/if}
				</dd>
			</div>
			<div class={fila}>
				<dt class="text-light-two_d dark:text-dark-two_d">Rol</dt>
				<dd class="font-medium">{$currentRole ? ROLE_LABEL[$currentRole] : ''}</dd>
			</div>
			{#if usuario && esUser}
				<div class={fila}>
					<dt class="text-light-two_d dark:text-dark-two_d">Plan</dt>
					<dd class="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
						<EstadoPlan cuenta={usuario} class="font-medium text-light-two dark:text-dark-two" />
						{#if accionPlan}
							<a
								href={accionPlan.href}
								target="_blank"
								rel="external noopener noreferrer"
								class={enlace}
							>
								{accionPlan.texto}
							</a>
						{/if}
					</dd>
				</div>
			{/if}
			{#if tarjeta}
				<div class={fila}>
					<dt class="text-light-two_d dark:text-dark-two_d">Tarjeta</dt>
					<dd>
						<a href={resolve('/panel/mi-tarjeta')} class={enlace}>Editar mi tarjeta</a>
					</dd>
				</div>
			{/if}
		</dl>
		{#if esUser && pro && accionPlan}
			<p class="mt-3 text-sm text-light-two_d dark:text-dark-two_d">
				El plan {pro.nombre} cuesta {formatearMonto(pro.precio, pro.moneda)} por {formatDuracion(
					pro.duracion_dias
				)} y te deja publicar tu tarjeta.
			</p>
		{/if}

		<section aria-labelledby="password-titulo" class="mt-12">
			<h2 id="password-titulo" class="font-display text-lg font-semibold">Cambiar contraseña</h2>
			<p class="mt-1 text-sm text-light-two_d dark:text-dark-two_d">
				Sigues con la sesión abierta aquí; las demás se cierran.
			</p>
			<form onsubmit={enviar} novalidate class="mt-6 space-y-5">
				{#if estado.error && Object.keys(estado.errores).length === 0}
					<AlertBox variant="error">{estado.error}</AlertBox>
				{/if}
				<Input
					label="Contraseña actual"
					type="password"
					autocomplete="current-password"
					required
					bind:value={actual}
					error={estado.errores.current_password}
				/>
				<Input
					label="Contraseña nueva"
					type="password"
					autocomplete="new-password"
					required
					hint="Al menos 8 caracteres, con letras y números."
					bind:value={nueva}
					error={estado.errores.new_password}
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
