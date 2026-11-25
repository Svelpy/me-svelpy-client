<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { CrearTarjetaForm, EditorTarjeta } from '#lib/components/features/editor/index.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { EditorSkeleton } from '#lib/components/skeletons/index.ts';
	import { AlertBox, Button } from '#lib/components/ui/index.ts';
	import type { TarjetaCompleta } from '#lib/interfaces/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { authStore, currentUserStore, miTarjetaStore } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { resumenDeTarjeta } from '#lib/utils/tarjeta.ts';

	let error = $state('');
	let cargando = $state(false);

	/** La tarjeta llega con `/usuarios/me` al entrar; si aún no está, se pide una vez */
	async function cargar() {
		cargando = true;
		error = '';
		try {
			await authStore.refreshUser();
		} catch (causa) {
			error = errorService.getMessage(causa);
		} finally {
			cargando = false;
		}
	}

	onMount(() => {
		if ($miTarjetaStore.estado === 'inicial') cargar();
	});

	/** Cada cambio guardado actualiza la sesión: nombre, foto y estado del header */
	function sincronizar(tarjeta: TarjetaCompleta) {
		miTarjetaStore.set(tarjeta);
		authStore.setTarjeta(resumenDeTarjeta(tarjeta));
	}

	/** Recién creada: se trae completa (con theme, SEO y vitrina) */
	async function creada() {
		await authStore.refreshUser();
		alert('success', 'Tu tarjeta está lista para completar');
	}
</script>

<MainLayout title="Mi tarjeta | Panel ME" noIndex>
	<div class="mx-auto w-full max-w-[100rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
		{#if error}
			<AlertBox variant="error" title="No se pudo cargar tu tarjeta">
				{error}
				{#snippet accion()}
					<Button size="sm" variant="secondary" loading={cargando} onclick={cargar}>
						Reintentar
					</Button>
				{/snippet}
			</AlertBox>
		{:else if $miTarjetaStore.estado === 'lista' && $miTarjetaStore.tarjeta && $currentUserStore}
			{#key $miTarjetaStore.tarjeta.id}
				<EditorTarjeta
					tarjeta={$miTarjetaStore.tarjeta}
					cuenta={$currentUserStore.user}
					modo="user"
					base={resolve('/panel/mi-tarjeta')}
					onActualizada={sincronizar}
				/>
			{/key}
		{:else if $miTarjetaStore.estado === 'sin-tarjeta'}
			<div class="mx-auto max-w-2xl py-6">
				<h1 class="font-display text-[1.875rem] leading-tight font-semibold tracking-[-0.01em]">
					Creemos tu tarjeta
				</h1>
				<p class="mt-2 text-light-two_d dark:text-dark-two_d">
					Con tu nombre y tu rubro dejamos lista una primera versión, en borrador. Después completas
					el resto y la publicas.
				</p>
				<div class="mt-8"><CrearTarjetaForm modo="user" onCreada={creada} /></div>
			</div>
		{:else}
			<EditorSkeleton />
		{/if}
	</div>
</MainLayout>
