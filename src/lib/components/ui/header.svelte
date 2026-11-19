<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ResolvedPathname } from '$app/types';
	import { LOGOS_ME } from '#lib/constants/index.ts';
	import { Menu2Icon } from '#lib/icons/outline/index.ts';

	interface Props {
		/** Estado del sidebar en móvil, para aria-expanded del botón de menú */
		sidebarOpen: boolean;
		/** id del sidebar que controla el botón de menú */
		sidebarId: string;
		onToggleSidebar: () => void;
		homeHref: ResolvedPathname;
		/** A la derecha (p. ej. el menú de usuario) */
		acciones?: Snippet;
	}

	let { sidebarOpen, sidebarId, onToggleSidebar, homeHref, acciones }: Props = $props();
</script>

<!-- Barra superior del panel con menú lateral, solo en pantallas angostas (en escritorio manda el sidebar) -->
<header
	class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-light-four/40 bg-light-one/90 px-4 backdrop-blur lg:hidden dark:border-dark-one_d dark:bg-dark-one/90"
>
	<button
		type="button"
		onclick={onToggleSidebar}
		aria-controls={sidebarId}
		aria-expanded={sidebarOpen}
		aria-label="Abrir menú"
		class="-ml-1.5 grid size-10 place-items-center rounded-xl text-light-two transition-colors hover:bg-light-one_d focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two dark:hover:bg-dark-one_d dark:focus-visible:outline-dark-three"
	>
		<Menu2Icon class="size-6" />
	</button>
	<a href={homeHref} class="flex items-center gap-2">
		<img src={LOGOS_ME.isotipoClaro} alt="" width="34" height="20" class="h-5 w-auto dark:hidden" />
		<img
			src={LOGOS_ME.isotipoOscuro}
			alt=""
			width="34"
			height="20"
			class="hidden h-5 w-auto dark:block"
		/>
		<span class="font-display text-[0.95rem] font-semibold text-light-two dark:text-dark-two">
			Panel
		</span>
	</a>
	{#if acciones}<div class="ml-auto flex items-center gap-2">{@render acciones()}</div>{/if}
</header>
