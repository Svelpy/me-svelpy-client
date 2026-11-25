<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Mantenimiento from '#lib/components/features/resumen/mantenimiento.svelte';
	import ResumenAdmin from '#lib/components/features/resumen/resumenAdmin.svelte';
	import { ResumenSkeleton } from '#lib/components/skeletons/index.ts';
	import { AlertBox, Button, PageHeader } from '#lib/components/ui/index.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { Action, Module } from '#lib/config/permissions.config.ts';
	import { errorService } from '#lib/services/index.ts';
	import { currentRole } from '#lib/stores/index.ts';
	import { can } from '#lib/utils/rbac.utils.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<MainLayout title="Inicio | Panel ME" noIndex>
	<PageHeader title="Inicio" description="Cómo están las tarjetas de ME hoy.">
		{#snippet actions()}
			<Button href={resolve('/panel/usuarios/nuevo')} variant="accent">Nueva cuenta</Button>
		{/snippet}
	</PageHeader>

	<div class="mt-9">
		{#await data.resumen}
			<ResumenSkeleton />
		{:then resumen}
			<ResumenAdmin {resumen} />
		{:catch error}
			<AlertBox variant="error" title="No se pudo cargar el resumen">
				{errorService.getMessage(error)}
				{#snippet accion()}
					<Button size="sm" variant="secondary" onclick={() => invalidate('app:resumen')}>
						Reintentar
					</Button>
				{/snippet}
			</AlertBox>
		{/await}
	</div>

	{#if can($currentRole, Module.MANTENIMIENTO, Action.UPDATE)}
		<Mantenimiento onDespublicadas={() => invalidate('app:resumen')} />
	{/if}
</MainLayout>
