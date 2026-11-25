<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import EstadoPublicacion from '#lib/components/features/panel/estadoPublicacion.svelte';
	import TablaPagos from '#lib/components/features/pagos/tablaPagos.svelte';
	import { EstadoPlan } from '#lib/components/features/planes/index.ts';
	import { accionesDeCuenta } from '#lib/components/features/usuarios/acciones.ts';
	import DialogosCuenta from '#lib/components/features/usuarios/dialogosCuenta.svelte';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { FormularioSkeleton } from '#lib/components/skeletons/index.ts';
	import { AlertBox, Avatar, Badge, Button, PageHeader } from '#lib/components/ui/index.ts';
	import { Action, Module, Role } from '#lib/config/permissions.config.ts';
	import { ROLE_LABEL } from '#lib/constants/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { currentRole, currentUserStore } from '#lib/stores/index.ts';
	import { formatDateLong } from '#lib/utils/format.ts';
	import { can, isRole } from '#lib/utils/rbac.utils.ts';
	import { rutaConQuery } from '#lib/utils/resolveRoute.ts';
	import { nombreCompleto } from '#lib/utils/tarjeta.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let dialogos = $state<DialogosCuenta>();
	const recargar = () => invalidate('app:cuenta');
	const puedeAnular = $derived(can($currentRole, Module.PAGO, Action.UPDATE));

	const seccion = 'border-t border-light-four/40 pt-8 dark:border-dark-one_d';
	const fila = 'flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between';
</script>

<MainLayout title="Cuenta | Panel ME" noIndex>
	<div class="max-w-5xl">
		{#await data.detalle}
			<FormularioSkeleton campos={6} />
		{:then { cuenta, tarjeta, pagos }}
			{@const puede = accionesDeCuenta($currentRole, cuenta, $currentUserStore?.user.id)}
			<PageHeader
				title={cuenta.email}
				volver={{ href: resolve('/panel/usuarios'), label: 'Usuarios' }}
			>
				{#snippet actions()}
					{#if puede.registrarPago}
						<Button
							href={rutaConQuery(resolve('/panel/pagos/nuevo'), { usuario: cuenta.id })}
							variant="accent"
						>
							Registrar pago
						</Button>
					{/if}
				{/snippet}
			</PageHeader>

			<dl
				class="mt-8 divide-y divide-light-four/40 rounded-2xl border border-light-four/40 text-sm dark:divide-dark-one_d dark:border-dark-one_d"
			>
				<div class={fila}>
					<dt class="text-light-two_d dark:text-dark-two_d">Rol</dt>
					<dd>
						<Badge variant={cuenta.rol === Role.USER ? 'secondary' : 'default'}>
							{isRole(cuenta.rol) ? ROLE_LABEL[cuenta.rol] : cuenta.rol}
						</Badge>
					</dd>
				</div>
				<div class={fila}>
					<dt class="text-light-two_d dark:text-dark-two_d">Estado</dt>
					<dd class={cuenta.is_active ? '' : 'font-medium'}>
						{cuenta.is_active ? 'Activa' : 'Dada de baja: no puede entrar y su tarjeta no se ve'}
					</dd>
				</div>
				<div class={fila}>
					<dt class="text-light-two_d dark:text-dark-two_d">Correo</dt>
					<dd>
						{cuenta.email_verified_at
							? `Verificado el ${formatDateLong(cuenta.email_verified_at)}`
							: 'Sin verificar: hasta que use el enlace no puede publicar'}
					</dd>
				</div>
				{#if cuenta.rol === Role.USER}
					<div class={fila}>
						<dt class="text-light-two_d dark:text-dark-two_d">Plan</dt>
						<dd>
							<EstadoPlan {cuenta} class="font-medium text-light-two dark:text-dark-two" />
						</dd>
					</div>
				{/if}
				<div class={fila}>
					<dt class="text-light-two_d dark:text-dark-two_d">Alta</dt>
					<dd>{formatDateLong(cuenta.created_at)}</dd>
				</div>
			</dl>

			{#if puede.editar || puede.enlacePassword || puede.darDeBaja || puede.reactivar || puede.eliminar}
				<div class="mt-4 flex flex-wrap gap-2">
					{#if puede.editar}
						<Button variant="secondary" size="sm" onclick={() => dialogos?.editar(cuenta)}>
							Editar cuenta
						</Button>
					{/if}
					{#if puede.enlacePassword}
						<Button variant="secondary" size="sm" onclick={() => dialogos?.enviarEnlace(cuenta)}>
							Enviar enlace de contraseña
						</Button>
					{/if}
					{#if puede.darDeBaja}
						<Button variant="secondary" size="sm" onclick={() => dialogos?.darDeBaja(cuenta)}>
							Dar de baja
						</Button>
					{/if}
					{#if puede.reactivar}
						<Button variant="secondary" size="sm" onclick={() => dialogos?.reactivar(cuenta)}>
							Reactivar cuenta
						</Button>
					{/if}
					{#if puede.eliminar}
						<Button
							variant="ghost"
							size="sm"
							class="text-light-error hover:bg-light-error/8 dark:text-dark-error"
							onclick={() => dialogos?.eliminar(cuenta)}
						>
							Eliminar cuenta
						</Button>
					{/if}
				</div>
			{/if}

			{#if cuenta.rol === Role.USER}
				<section aria-labelledby="su-tarjeta" class="mt-10 {seccion}">
					<h2 id="su-tarjeta" class="font-display text-lg font-semibold">Su tarjeta</h2>
					{#if tarjeta}
						<a
							href={resolve('/panel/tarjetas/[id]', { id: tarjeta.id })}
							class="mt-4 flex items-center gap-4 rounded-2xl border border-light-four/40 p-4 transition-colors hover:border-light-four_d focus-visible:outline-2 focus-visible:outline-light-three dark:border-dark-one_d dark:hover:border-dark-four"
						>
							<Avatar src={tarjeta.profile_url} nombre={nombreCompleto(tarjeta)} size="md" />
							<span class="min-w-0 flex-1">
								<span class="block truncate font-semibold">{nombreCompleto(tarjeta)}</span>
								<span
									class="block truncate font-mono text-xs text-light-two_d dark:text-dark-two_d"
								>
									/{tarjeta.slug}
								</span>
							</span>
							<EstadoPublicacion publicada={tarjeta.is_public} />
						</a>
					{:else}
						<p class="mt-2 text-sm text-light-two_d dark:text-dark-two_d">
							Todavía no tiene tarjeta.
						</p>
						{#if puede.crearTarjeta}
							<Button
								href={rutaConQuery(resolve('/panel/tarjetas/nueva'), { cuenta: cuenta.id })}
								variant="secondary"
								size="sm"
								class="mt-3"
							>
								Crear su tarjeta
							</Button>
						{/if}
					{/if}
				</section>

				<section aria-labelledby="sus-pagos" class="mt-10 {seccion}">
					<div class="flex flex-wrap items-baseline justify-between gap-3">
						<h2 id="sus-pagos" class="font-display text-lg font-semibold">Pagos</h2>
						{#if pagos.total > pagos.data.length}
							<a
								href={rutaConQuery(resolve('/panel/pagos'), { cuenta: cuenta.id })}
								class="text-sm font-semibold text-light-two_d hover:text-light-two dark:text-dark-two_d dark:hover:text-dark-two"
							>
								Ver los {pagos.total}
							</a>
						{/if}
					</div>
					{#if pagos.data.length === 0}
						<p class="mt-2 text-sm text-light-two_d dark:text-dark-two_d">
							Sin pagos. Con el plan Free arma su tarjeta, pero no la publica.
						</p>
					{:else}
						<div class="mt-4">
							<TablaPagos pagos={pagos.data} sinCuenta {puedeAnular} onAnulado={recargar} />
						</div>
					{/if}
				</section>
			{/if}

			<DialogosCuenta
				bind:this={dialogos}
				onCambio={recargar}
				onEliminada={() => goto(resolve('/panel/usuarios'), { replace: true })}
			/>
		{:catch error}
			<AlertBox variant="error" title="No se pudo abrir la cuenta">
				{errorService.getMessage(error)}
			</AlertBox>
		{/await}
	</div>
</MainLayout>
