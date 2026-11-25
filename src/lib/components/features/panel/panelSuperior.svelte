<!--
	Carcasa del user: gestiona una sola cosa (su tarjeta), así que el menú es una barra superior y
	el editor con su vista previa ocupa todo el ancho. Sin el correo verificado, una franja lo recuerda.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { ThemeToggle } from '#lib/components/ui/index.ts';
	import { PANEL_NAVIGATION } from '#lib/config/navigation.config.ts';
	import { LOGOS_ME } from '#lib/constants/index.ts';
	import { currentRole, currentUserStore } from '#lib/stores/index.ts';
	import { filterNavigation, isNavItemActive } from '#lib/utils/navigation.ts';
	import { getHomeRoute } from '#lib/utils/rbac.utils.ts';
	import { resolveStaticRoute } from '#lib/utils/resolveRoute.ts';
	import AvisoVerificacion from './avisoVerificacion.svelte';
	import MenuUsuario from './menuUsuario.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const items = $derived(filterNavigation(PANEL_NAVIGATION, $currentRole).flatMap((s) => s.items));
	const inicio = $derived(
		$currentRole ? resolveStaticRoute(getHomeRoute($currentRole)) : resolve('/panel')
	);
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

	<header
		class="sticky top-0 z-30 border-b border-light-four/40 bg-light-one/90 backdrop-blur-md dark:border-dark-one_d dark:bg-dark-one/90"
	>
		<div class="mx-auto flex h-16 max-w-[100rem] items-center gap-2 px-4 sm:px-6">
			<a
				href={inicio}
				class="flex shrink-0 items-center rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-light-three dark:focus-visible:outline-dark-three"
			>
				<img
					src={LOGOS_ME.isotipoClaro}
					alt=""
					width="38"
					height="22"
					class="h-[1.375rem] w-auto dark:hidden"
				/>
				<img
					src={LOGOS_ME.isotipoOscuro}
					alt=""
					width="38"
					height="22"
					class="hidden h-[1.375rem] w-auto dark:block"
				/>
				<span class="sr-only">ME, ir a mi tarjeta</span>
			</a>

			<nav aria-label="Panel" class="ml-3 hidden h-full items-stretch gap-1 sm:flex">
				{#each items as item (item.id)}
					{@const activo = isNavItemActive(item, page.url.pathname)}
					<a
						href={item.href}
						aria-current={activo ? 'page' : undefined}
						class={[
							'relative flex items-center px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-light-three dark:focus-visible:outline-dark-three',
							activo
								? 'text-light-two dark:text-dark-two'
								: 'text-light-two_d hover:text-light-two dark:text-dark-two_d dark:hover:text-dark-two'
						]}
					>
						{item.label}
						{#if activo}
							<span
								class="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-light-accent dark:bg-dark-accent"
								aria-hidden="true"
							></span>
						{/if}
					</a>
				{/each}
			</nav>

			<!-- El estado y el enlace de la tarjeta viven en la cabecera del editor; aquí no se repiten -->
			<div class="ml-auto flex min-w-0 items-center gap-2">
				<ThemeToggle />
				<MenuUsuario />
			</div>
		</div>
	</header>

	{#if $currentUserStore && !$currentUserStore.user.email_verified_at}
		<AvisoVerificacion email={$currentUserStore.user.email} />
	{/if}

	<main id="contenido" tabindex="-1" class="outline-none">
		{@render children()}
	</main>
</div>
