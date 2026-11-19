<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ResolvedPathname } from '$app/types';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import { LOGOS_ME } from '#lib/constants/index.ts';
	import { XIcon } from '#lib/icons/outline/index.ts';
	import type { NavSection } from '#lib/interfaces/index.ts';
	import { isNavItemActive } from '#lib/utils/navigation.ts';
	import SidebarItem from './sidebarItem.svelte';

	interface Props {
		sections: NavSection[];
		/** Solo aplica en pantallas < lg; en escritorio el sidebar siempre está visible */
		open: boolean;
		id?: string;
		/** Destino del logo: la página de inicio del rol */
		homeHref: ResolvedPathname;
		/** Pie del menú: usuario, modo de color y cerrar sesión */
		pie?: Snippet;
	}

	let { sections, open = $bindable(false), id = 'app-sidebar', homeHref, pie }: Props = $props();

	const isDesktop = new MediaQuery('(min-width: 1024px)', false);
	let closeButton = $state<HTMLButtonElement>();

	function close() {
		open = false;
	}

	// Cerrar el cajón al navegar a otra página
	afterNavigate(close);

	// Si la pantalla pasa a escritorio con el cajón abierto, cerrarlo
	$effect(() => {
		if (isDesktop.current) close();
	});

	// Cajón abierto en móvil: bloquear el scroll del fondo y mover el foco al cajón
	$effect(() => {
		if (!open || isDesktop.current) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeButton?.focus();
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<button
		type="button"
		tabindex="-1"
		aria-label="Cerrar menú"
		class="fixed inset-0 z-40 bg-light-black/50 backdrop-blur-sm lg:hidden"
		onclick={close}
		transition:fade={{ duration: 200 }}
	></button>
{/if}

<!-- Tinta ciruela en claro y noche ciruela en oscuro. Cerrado en móvil: fuera de pantalla e `invisible` -->
<aside
	{id}
	aria-label="Menú del panel"
	class={[
		'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-light-three text-white transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none lg:visible lg:w-64 lg:translate-x-0 dark:border-r dark:border-dark-one_d dark:bg-[#120a14]',
		open ? 'visible translate-x-0 shadow-2xl' : 'invisible -translate-x-full'
	]}
>
	<div class="flex h-16 shrink-0 items-center justify-between gap-3 px-6">
		<a
			href={homeHref}
			class="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
		>
			<img src={LOGOS_ME.isotipoOscuro} alt="" width="34" height="20" class="h-5 w-auto" />
			<span class="font-display text-[0.95rem] font-semibold tracking-tight">Panel</span>
			<span class="sr-only">, ir al inicio</span>
		</a>
		<button
			bind:this={closeButton}
			type="button"
			onclick={close}
			aria-label="Cerrar menú"
			class="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
		>
			<XIcon />
		</button>
	</div>

	<nav aria-label="Secciones del panel" class="flex-1 overflow-y-auto px-3 pt-4 pb-6">
		{#each sections as section (section.id)}
			<div class="mt-7 first:mt-0">
				<p class="mb-2 px-3 text-xs font-medium text-white/45">{section.label}</p>
				<ul class="space-y-0.5">
					{#each section.items as item (item.id)}
						<li><SidebarItem {item} active={isNavItemActive(item, page.url.pathname)} /></li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>

	{#if pie}
		<div class="shrink-0 border-t border-white/10 px-3 py-4">{@render pie()}</div>
	{/if}
</aside>
