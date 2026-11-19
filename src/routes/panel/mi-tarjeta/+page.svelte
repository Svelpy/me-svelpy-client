<script lang="ts">
	import { resolve } from '$app/paths';
	import { CrearTarjetaForm, EditorTarjeta } from '#lib/components/features/editor/index.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { EditorSkeleton } from '#lib/components/skeletons/index.ts';
	import { AlertBox, Button } from '#lib/components/ui/index.ts';
	import type { TarjetaCompleta } from '#lib/interfaces/index.ts';
	import { authStore, miTarjetaStore } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { resumenDeTarjeta } from '#lib/utils/tarjeta.ts';

	// La tarjeta llegó completa con una sola petición al iniciar sesión; al recargar se pide una vez
	$effect(() => {
		miTarjetaStore.cargar();
	});

	/** Cada cambio guardado actualiza la sesión: nombre, foto y estado del header */
	function sincronizar(tarjeta: TarjetaCompleta) {
		miTarjetaStore.set(tarjeta);
		authStore.setTarjeta(resumenDeTarjeta(tarjeta));
	}

	function creada(tarjeta: TarjetaCompleta) {
		sincronizar(tarjeta);
		alert('success', 'Tu tarjeta está lista para completar');
	}
</script>

<MainLayout title="Mi tarjeta | Panel ME" noIndex>
	<div class="mx-auto w-full max-w-[100rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
		{#if $miTarjetaStore.estado === 'lista' && $miTarjetaStore.tarjeta}
			<EditorTarjeta
				tarjeta={$miTarjetaStore.tarjeta}
				modo="owner"
				base={resolve('/panel/mi-tarjeta')}
				onActualizada={sincronizar}
			/>
		{:else if $miTarjetaStore.estado === 'sin-tarjeta'}
			<div class="mx-auto max-w-2xl py-6">
				<h1 class="font-display text-[1.875rem] leading-tight font-semibold tracking-[-0.01em]">
					Creemos tu tarjeta
				</h1>
				<p class="mt-2 text-light-two_d dark:text-dark-two_d">
					Con tu nombre y tu rubro dejamos lista una primera versión, en borrador. Después completas
					el resto y la publicas.
				</p>
				<div class="mt-8"><CrearTarjetaForm modo="owner" onCreada={creada} /></div>
			</div>
		{:else if $miTarjetaStore.estado === 'error'}
			<AlertBox variant="error" title="No se pudo cargar tu tarjeta">
				{$miTarjetaStore.error}
				{#snippet accion()}
					<Button size="sm" variant="secondary" onclick={() => miTarjetaStore.cargar(true)}>
						Reintentar
					</Button>
				{/snippet}
			</AlertBox>
		{:else}
			<EditorSkeleton />
		{/if}
	</div>
</MainLayout>
