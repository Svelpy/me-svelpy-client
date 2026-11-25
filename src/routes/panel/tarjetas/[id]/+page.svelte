<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { EditorTarjeta } from '#lib/components/features/editor/index.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { EditorSkeleton } from '#lib/components/skeletons/index.ts';
	import { AlertBox, Button, ModalConfirm } from '#lib/components/ui/index.ts';
	import { Action, Module } from '#lib/config/permissions.config.ts';
	import { ArrowLeftIcon } from '#lib/icons/outline/index.ts';
	import { errorService, tarjetaService } from '#lib/services/index.ts';
	import { currentRole } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { can } from '#lib/utils/rbac.utils.ts';
	import { nombreCompleto } from '#lib/utils/tarjeta.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let confirmar = $state(false);
	let eliminando = $state(false);

	// Eliminar es solo del superadmin; el admin hace todo lo demás
	const puedeEliminar = $derived(can($currentRole, Module.TARJETA, Action.DELETE));

	async function eliminar(id: string) {
		eliminando = true;
		try {
			await tarjetaService.eliminar(id);
			alert('success', 'Tarjeta eliminada');
			await goto(resolve('/panel/tarjetas'), { replace: true });
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			eliminando = false;
			confirmar = false;
		}
	}
</script>

<MainLayout title="Editar tarjeta | Panel ME" noIndex>
	<a
		href={resolve('/panel/tarjetas')}
		class="mb-5 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-light-two_d hover:text-light-two dark:text-dark-two_d dark:hover:text-dark-two"
	>
		<ArrowLeftIcon class="size-4" />
		Tarjetas
	</a>

	{#await data.editor}
		<EditorSkeleton />
	{:then { tarjeta, cuenta }}
		{#key tarjeta.id}
			<EditorTarjeta
				{tarjeta}
				{cuenta}
				modo="admin"
				base={resolve('/panel/tarjetas/[id]', { id: tarjeta.id })}
			>
				{#snippet encabezado()}
					<p class="mt-2 text-sm text-light-two_d dark:text-dark-two_d">
						Cuenta:
						<a
							href={resolve('/panel/usuarios/[id]', { id: cuenta.id })}
							class="font-medium text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:text-dark-two dark:decoration-dark-four"
						>
							{cuenta.email}
						</a>{cuenta.is_active ? '' : ' (dada de baja: la tarjeta no se ve en público)'}
					</p>
				{/snippet}
				{#snippet acciones()}
					{#if puedeEliminar}
						<Button
							variant="ghost"
							class="text-light-error hover:bg-light-error/8 dark:text-dark-error"
							onclick={() => (confirmar = true)}
						>
							Eliminar tarjeta
						</Button>
					{/if}
				{/snippet}
			</EditorTarjeta>
		{/key}
		<ModalConfirm
			isOpen={confirmar}
			title="¿Eliminar la tarjeta de {nombreCompleto(tarjeta)}?"
			message="Deja de verse en /{tarjeta.slug} de inmediato y se borra todo su contenido: diseño, contactos, ubicaciones, vitrina… No se puede deshacer."
			confirmLabel="Eliminar tarjeta"
			loading={eliminando}
			onConfirm={() => eliminar(tarjeta.id)}
			onCancel={() => (confirmar = false)}
		/>
	{:catch error}
		<AlertBox variant="error" title="No se pudo abrir la tarjeta">
			{errorService.getMessage(error)}
		</AlertBox>
	{/await}
</MainLayout>
