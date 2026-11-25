<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CrearTarjetaForm } from '#lib/components/features/editor/index.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { FormularioSkeleton } from '#lib/components/skeletons/index.ts';
	import { AlertBox, Button, EmptyState, PageHeader } from '#lib/components/ui/index.ts';
	import { UserPlusIcon } from '#lib/icons/outline/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<MainLayout title="Nueva tarjeta | Panel ME" noIndex>
	<div class="max-w-3xl">
		<PageHeader
			title="Nueva tarjeta"
			description="Para una cuenta que aún no tiene. Nace en borrador con el tema que sugiere su rubro."
			volver={{ href: resolve('/panel/tarjetas'), label: 'Tarjetas' }}
		/>
		<div class="mt-8">
			{#await data.cuentas}
				<FormularioSkeleton campos={5} />
			{:then cuentas}
				{#if cuentas.length === 0}
					<EmptyState
						icono={UserPlusIcon}
						titulo="No hay cuentas activas"
						descripcion="Crea una cuenta nueva; puedes armar su tarjeta en el mismo paso."
					>
						{#snippet acciones()}
							<Button href={resolve('/panel/usuarios/nuevo')} variant="accent">Nueva cuenta</Button>
						{/snippet}
					</EmptyState>
				{:else}
					<CrearTarjetaForm
						modo="admin"
						{cuentas}
						cuentaInicial={data.cuentaInicial}
						onCreada={(tarjeta) => {
							alert('success', 'Tarjeta creada');
							goto(resolve('/panel/tarjetas/[id]', { id: tarjeta.id }), { replace: true });
						}}
					/>
				{/if}
			{:catch error}
				<AlertBox variant="error">{errorService.getMessage(error)}</AlertBox>
			{/await}
		</div>
	</div>
</MainLayout>
