<!-- Carcasa del superadmin: recorre varias áreas, así que el menú vive a la izquierda -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Header, Sidebar, ThemeToggle } from '#lib/components/ui/index.ts';
	import { PANEL_NAVIGATION } from '#lib/config/navigation.config.ts';
	import { ROLE_LABEL } from '#lib/constants/index.ts';
	import { LogOutIcon } from '#lib/icons/outline/index.ts';
	import { authStore, currentRole, currentUserStore } from '#lib/stores/index.ts';
	import { filterNavigation } from '#lib/utils/navigation.ts';
	import { getHomeRoute } from '#lib/utils/rbac.utils.ts';
	import { resolveStaticRoute } from '#lib/utils/resolveRoute.ts';
	import { iniciales } from '#lib/utils/tarjeta.ts';
	import MenuUsuario from './menuUsuario.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let abierto = $state(false);

	const secciones = $derived(filterNavigation(PANEL_NAVIGATION, $currentRole));
	const inicio = $derived(
		$currentRole ? resolveStaticRoute(getHomeRoute($currentRole)) : resolve('/panel')
	);
	const email = $derived($currentUserStore?.user.email ?? '');

	async function salir() {
		await authStore.logout();
		await goto(resolve('/auth/sign-in'), { replace: true });
	}
</script>

<div
	data-area="app"
	class="min-h-dvh bg-light-one font-sans text-light-two dark:bg-dark-one dark:text-dark-two"
>
	<a
		href="#contenido"
		class="sr-only rounded-xl bg-light-accent px-4 py-2 font-semibold text-light-black focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70]"
	>
		Saltar al contenido
	</a>

	<Sidebar sections={secciones} bind:open={abierto} homeHref={inicio}>
		{#snippet pie()}
			<div class="flex items-center gap-3 px-2">
				<span
					class="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 font-display text-sm font-semibold"
				>
					{iniciales(email)}
				</span>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium">{email}</p>
					<p class="text-xs text-white/55">{$currentRole ? ROLE_LABEL[$currentRole] : ''}</p>
				</div>
			</div>
			<div class="mt-4 flex items-center justify-between gap-1 px-1">
				<ThemeToggle sobreOscuro />
				<button
					type="button"
					onclick={salir}
					class="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-sm font-medium whitespace-nowrap text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/70"
				>
					<LogOutIcon class="size-4" />
					Cerrar sesión
				</button>
			</div>
		{/snippet}
	</Sidebar>

	<div class="lg:pl-64">
		<Header
			sidebarOpen={abierto}
			sidebarId="app-sidebar"
			onToggleSidebar={() => (abierto = !abierto)}
			homeHref={inicio}
		>
			{#snippet acciones()}<MenuUsuario />{/snippet}
		</Header>
		<main
			id="contenido"
			tabindex="-1"
			class="mx-auto w-full max-w-[90rem] px-4 py-7 outline-none sm:px-6 lg:px-10 lg:py-10"
		>
			{@render children()}
		</main>
	</div>
</div>
