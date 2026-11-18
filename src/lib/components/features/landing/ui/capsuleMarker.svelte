<!--
	Marcador de lista con la forma de la cápsula central del isotipo ME.
	`off` dibuja una cápsula gris tachada para los puntos negativos (tarjeta de papel).
-->
<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		variant?: 'on' | 'off';
		class?: string;
	}

	let { variant = 'on', class: className = '' }: Props = $props();
</script>

<span
	aria-hidden="true"
	class={cn(
		'relative mt-[0.4em] inline-block h-[1.05em] w-[0.42em] shrink-0 rounded-full',
		variant === 'on' ? 'bg-secondary' : 'bg-primary-200',
		className
	)}
>
	{#if variant === 'off'}
		<span
			class="absolute top-1/2 left-1/2 h-[2px] w-[1.1em] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-primary-500"
		></span>
	{/if}
</span>
