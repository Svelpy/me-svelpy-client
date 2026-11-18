<!--
	Encabezado de sección (h2 + bajada). El `id` se usa en el aria-labelledby de la sección.
-->
<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		id: string;
		title: string;
		subtitle?: string;
		tone?: 'light' | 'dark';
		class?: string;
	}

	let { id, title, subtitle, tone = 'light', class: className = '' }: Props = $props();
</script>

<header class={cn('max-w-3xl', className)}>
	<h2
		{id}
		class={cn(
			'font-display text-[2rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance sm:text-[2.75rem]',
			tone === 'dark' ? 'text-white' : 'text-primary-900'
		)}
	>
		{title}
	</h2>
	{#if subtitle}
		<p
			class={cn(
				'mt-5 max-w-[60ch] text-lg leading-relaxed text-pretty',
				tone === 'dark' ? 'text-primary-300' : 'text-primary-600'
			)}
		>
			{subtitle}
		</p>
	{/if}
</header>
