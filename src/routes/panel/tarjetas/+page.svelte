<script lang="ts">
	import TarjetaFuentes from '#lib/components/features/tarjeta/tarjetaFuentes.svelte';
	import { TIPOGRAFIAS_TARJETA } from '#lib/config/tipografiasTarjeta.config.ts';
	import { goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import EstadoPublicacion from '#lib/components/features/panel/estadoPublicacion.svelte';
	import MiniTarjeta from '#lib/components/features/tarjetas/miniTarjeta.svelte';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { DirectorioSkeleton, TablaSkeleton } from '#lib/components/skeletons/index.ts';
	import {
		AlertBox,
		Avatar,
		Button,
		EmptyState,
		Input,
		PageHeader,
		Pagination,
		SegmentedControl
	} from '#lib/components/ui/index.ts';
	import { IdIcon, LayoutGridIcon, ListIcon, SearchIcon } from '#lib/icons/outline/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { formatDate } from '#lib/utils/format.ts';
	import { nombreCompleto } from '#lib/utils/tarjeta.ts';
	import { queryConFiltros } from '#lib/utils/filtrosUrl.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let busqueda = $state(page.url.searchParams.get('q') ?? '');
	let temporizador: ReturnType<typeof setTimeout> | undefined;

	/** Cambia un filtro en la URL (y vuelve a la página 1 salvo que cambie la página) */
	function filtrar(cambios: Record<string, string | null>) {
		const query = queryConFiltros(page.url.searchParams, cambios);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve('/panel/tarjetas')}${query ? `?${query}` : ''}`, {
			reset: false,
			replace: true
		});
	}

	function buscar(valor: string) {
		busqueda = valor;
		clearTimeout(temporizador);
		temporizador = setTimeout(() => filtrar({ q: valor.trim() || null }), 300);
	}

	const editar = (id: string) => resolve('/panel/tarjetas/[id]', { id });
</script>

<!-- Las mini-tarjetas muestran el nombre con la fuente de cada una -->
<TarjetaFuentes tipografias={TIPOGRAFIAS_TARJETA} precargar={false} />

<MainLayout title="Tarjetas | Panel ME" noIndex>
	<PageHeader title="Tarjetas" description="Todas las tarjetas, cada una con sus propios colores.">
		{#snippet actions()}
			<Button href={resolve('/panel/tarjetas/nueva')} variant="accent">Nueva tarjeta</Button>
		{/snippet}
	</PageHeader>

	<div class="mt-8 flex flex-col gap-3 lg:flex-row lg:items-end">
		<Input
			type="search"
			label="Buscar"
			placeholder="Nombre, dirección, rubro, empresa o correo"
			icon={SearchIcon}
			value={busqueda}
			oninput={(event) => buscar(event.currentTarget.value)}
			class="lg:w-96"
		/>
		<SegmentedControl
			label="Estado"
			options={[
				{ value: 'todas', label: 'Todas' },
				{ value: 'publicada', label: 'Publicadas' },
				{ value: 'borrador', label: 'Borradores' }
			]}
			value={data.filtros.estado ?? 'todas'}
			onchange={(valor) => filtrar({ estado: valor === 'todas' ? null : valor })}
		/>
		<SegmentedControl
			label="Vista"
			labelOculta
			options={[
				{ value: 'mosaico', label: 'Mosaico', icon: LayoutGridIcon },
				{ value: 'lista', label: 'Lista', icon: ListIcon }
			]}
			value={data.vista}
			onchange={(valor) =>
				filtrar({
					vista: valor === 'lista' ? 'lista' : null,
					page: page.url.searchParams.get('page')
				})}
			class="lg:ml-auto"
		/>
	</div>

	<div class="mt-7">
		{#await data.listado}
			{#if data.vista === 'mosaico'}<DirectorioSkeleton />{:else}<TablaSkeleton
					etiqueta="Cargando las tarjetas"
				/>{/if}
		{:then listado}
			{#if listado.data.length === 0}
				<EmptyState
					icono={IdIcon}
					titulo={data.filtros.q || data.filtros.estado
						? 'Ninguna tarjeta coincide'
						: 'Todavía no hay tarjetas'}
					descripcion={data.filtros.q || data.filtros.estado
						? 'Prueba con otro nombre o quita los filtros.'
						: 'Crea la primera para una cuenta de propietario.'}
				>
					{#snippet acciones()}
						{#if data.filtros.q || data.filtros.estado}
							<Button
								variant="secondary"
								onclick={() => {
									busqueda = '';
									filtrar({ q: null, estado: null });
								}}
							>
								Quitar filtros
							</Button>
						{:else}
							<Button href={resolve('/panel/tarjetas/nueva')} variant="accent">
								Nueva tarjeta
							</Button>
						{/if}
					{/snippet}
				</EmptyState>
			{:else if data.vista === 'mosaico'}
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
					{#each listado.data as tarjeta (tarjeta.id)}
						<li><MiniTarjeta {tarjeta} href={editar(tarjeta.id)} /></li>
					{/each}
				</ul>
			{:else}
				<div class="overflow-x-auto rounded-2xl border border-light-four/40 dark:border-dark-one_d">
					<table class="w-full min-w-[44rem] text-sm">
						<thead
							class="bg-light-one_d/60 text-left text-xs font-semibold text-light-two_d dark:bg-dark-one_d/40 dark:text-dark-two_d"
						>
							<tr>
								<th scope="col" class="px-4 py-3">Tarjeta</th>
								<th scope="col" class="px-4 py-3">Rubro</th>
								<th scope="col" class="px-4 py-3">Propietario</th>
								<th scope="col" class="px-4 py-3">Estado</th>
								<th scope="col" class="px-4 py-3">Actualizada</th>
							</tr>
						</thead>
						<tbody>
							{#each listado.data as tarjeta (tarjeta.id)}
								<tr class="border-t border-light-four/35 dark:border-dark-one_d">
									<td class="px-4 py-3">
										<a
											href={editar(tarjeta.id)}
											class="flex items-center gap-3 rounded-lg font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-light-three"
										>
											<Avatar
												src={tarjeta.profile_url}
												nombre={nombreCompleto(tarjeta)}
												size="sm"
											/>
											<span class="min-w-0">
												<span class="block truncate">{nombreCompleto(tarjeta)}</span>
												<span
													class="block truncate font-mono text-xs font-normal text-light-two_d dark:text-dark-two_d"
												>
													/{tarjeta.slug}
												</span>
											</span>
										</a>
									</td>
									<td class="px-4 py-3 text-light-two_d dark:text-dark-two_d">{tarjeta.rubro}</td>
									<td class="px-4 py-3 text-light-two_d dark:text-dark-two_d">
										{tarjeta.propietario.email}
									</td>
									<td class="px-4 py-3"><EstadoPublicacion publicada={tarjeta.is_public} /></td>
									<td class="px-4 py-3 text-light-two_d tabular-nums dark:text-dark-two_d">
										{formatDate(tarjeta.updated_at)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
			{#if listado.total > 0}
				<div class="mt-6">
					<Pagination
						currentPage={listado.page}
						totalPages={listado.total_pages}
						perPage={listado.per_page}
						total={listado.total}
						nombre={listado.total === 1 ? 'tarjeta' : 'tarjetas'}
						onPageChange={(numero) => filtrar({ page: String(numero) })}
					/>
				</div>
			{/if}
		{:catch error}
			<AlertBox variant="error" title="No se pudieron cargar las tarjetas">
				{errorService.getMessage(error)}
				{#snippet accion()}
					<Button size="sm" variant="secondary" onclick={() => invalidate('app:tarjetas')}>
						Reintentar
					</Button>
				{/snippet}
			</AlertBox>
		{/await}
	</div>
</MainLayout>
