<script lang="ts">
	import type { NavItem } from '#lib/interfaces/index.ts';

	interface Props {
		item: NavItem;
		active: boolean;
	}

	let { item, active }: Props = $props();
</script>

<!-- El único naranja del menú: la barra que marca dónde estás -->
<a
	href={item.href}
	aria-current={active ? 'page' : undefined}
	class={[
		'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/70',
		active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
	]}
>
	{#if active}
		<span
			class="absolute inset-y-2 -left-3 w-1 rounded-r-full bg-light-accent dark:bg-dark-accent"
			aria-hidden="true"
		></span>
	{/if}
	<item.icon class="size-5 shrink-0" />
	<span class="truncate">{item.label}</span>
</a>
