<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import TablaPagos from '#lib/components/features/pagos/tablaPagos.svelte';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { TablaSkeleton } from '#lib/components/skeletons/index.ts';
	import {
		AlertBox,
		Button,
		EmptyState,
		PageHeader,
		Pagination,
		Select
	} from '#lib/components/ui/index.ts';
	import { Action, Module } from '#lib/config/permissions.config.ts';
	import { WalletIcon, XIcon } from '#lib/icons/outline/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { currentRole } from '#lib/stores/index.ts';
	import { queryConFiltros } from '#lib/utils/filtrosUrl.ts';
	import { can } from '#lib/utils/rbac.utils.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function filtrar(cambios: Record<string, string | null>) {
		const query = queryConFiltros(page.url.searchParams, cambios);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve('/panel/pagos')}${query ? `?${query}` : ''}`, { reset: false, replace: true });
	}

	const recargar = () => invalidate('app:pagos');
	const conFiltros = $derived(!!data.filtros.plan_id || !!data.filtros.user_id);
	const puedeAnular = $derived(can($currentRole, Module.PAGO, Action.UPDATE));
</script>

<MainLayout title="Pagos | Panel ME" noIndex>
	<PageHeader
		title="Pagos"
		description="Cada pago renueva el plan de una cuenta. Anular uno descuenta los días que había sumado."
	>
		{#snippet actions()}
			<Button href={resolve('/panel/pagos/nuevo')} variant="accent">Registrar pago</Button>
		{/snippet}
	</PageHeader>

	<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
		{#await data.planes then planes}
			{#if planes.length > 0}
				<Select
					label="Plan"
					value={data.filtros.plan_id ?? ''}
					onchange={(event) => filtrar({ plan: event.currentTarget.value || null })}
					class="sm:w-56"
				>
					<option value="">Todos</option>
					{#each planes as plan (plan.id)}<option value={plan.id}>{plan.nombre}</option>{/each}
				</Select>
			{/if}
		{/await}
		{#if data.filtros.user_id}
			<button
				type="button"
				onclick={() => filtrar({ cuenta: null })}
				class="inline-flex h-10 items-center gap-2 self-start rounded-full border border-light-four/60 px-4 text-sm font-medium hover:bg-light-one_d focus-visible:outline-2 focus-visible:outline-light-three sm:self-auto dark:border-dark-four/60 dark:hover:bg-dark-one_d dark:focus-visible:outline-dark-three"
			>
				De una sola cuenta
				<XIcon class="size-4" />
				<span class="sr-only">Quitar el filtro de cuenta</span>
			</button>
		{/if}
	</div>

	<div class="mt-7">
		{#await data.listado}
			<TablaSkeleton columnas={6} etiqueta="Cargando los pagos" />
		{:then listado}
			{#if listado.data.length === 0}
				<EmptyState
					icono={WalletIcon}
					titulo={conFiltros ? 'Ningún pago coincide' : 'Todavía no hay pagos'}
					descripcion={conFiltros
						? 'Prueba con otro plan o quita los filtros.'
						: 'Registra el primero cuando alguien pague su plan.'}
				>
					{#snippet acciones()}
						{#if conFiltros}
							<Button variant="secondary" onclick={() => filtrar({ plan: null, cuenta: null })}>
								Quitar filtros
							</Button>
						{:else}
							<Button href={resolve('/panel/pagos/nuevo')} variant="accent">Registrar pago</Button>
						{/if}
					{/snippet}
				</EmptyState>
			{:else}
				<TablaPagos pagos={listado.data} {puedeAnular} onAnulado={recargar} />
				<div class="mt-6">
					<Pagination
						currentPage={listado.page}
						totalPages={listado.total_pages}
						perPage={listado.per_page}
						total={listado.total}
						nombre={listado.total === 1 ? 'pago' : 'pagos'}
						onPageChange={(numero) => filtrar({ page: String(numero) })}
					/>
				</div>
			{/if}
		{:catch error}
			<AlertBox variant="error" title="No se pudieron cargar los pagos">
				{errorService.getMessage(error)}
				{#snippet accion()}
					<Button size="sm" variant="secondary" onclick={recargar}>Reintentar</Button>
				{/snippet}
			</AlertBox>
		{/await}
	</div>
</MainLayout>
