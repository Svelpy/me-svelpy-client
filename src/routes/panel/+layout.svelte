<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PanelLateral from '#lib/components/features/panel/panelLateral.svelte';
	import PanelSuperior from '#lib/components/features/panel/panelSuperior.svelte';
	import { PANEL_DISENO } from '#lib/config/navigation.config.ts';
	import { authService } from '#lib/services/index.ts';
	import { signInUrl } from '#lib/utils/signInReason.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const diseno = $derived(PANEL_DISENO[data.role]);

	// Si el servidor rechaza la sesión en medio del uso, se vuelve al login explicando por qué
	$effect(() =>
		authService.onSessionExpired(() => {
			goto(signInUrl({ reason: 'expirada', redirectTo: page.url.pathname + page.url.search }), {
				replace: true
			});
		})
	);
</script>

{#if diseno === 'lateral'}
	<PanelLateral>{@render children()}</PanelLateral>
{:else}
	<PanelSuperior>{@render children()}</PanelSuperior>
{/if}
