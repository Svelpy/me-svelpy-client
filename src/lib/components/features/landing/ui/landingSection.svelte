<!--
	Contenedor de sección de la landing: fondo por tono, ancho máximo y márgenes laterales comunes.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';

	type Tone = 'white' | 'mist' | 'night';

	interface Props {
		id?: string;
		/** id del encabezado que nombra la sección (aria-labelledby). */
		labelledby?: string;
		tone?: Tone;
		class?: string;
		containerClass?: string;
		children: Snippet;
	}

	let {
		id,
		labelledby,
		tone = 'white',
		class: className = '',
		containerClass = '',
		children
	}: Props = $props();

	const tones: Record<Tone, string> = {
		white: 'bg-white text-primary-900',
		mist: 'bg-primary-50 text-primary-900',
		night: 'bg-primary-950 text-white'
	};
</script>

<section
	{id}
	aria-labelledby={labelledby}
	class={cn('relative py-20 sm:py-28', tones[tone], className)}
>
	<div class={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', containerClass)}>
		{@render children()}
	</div>
</section>
