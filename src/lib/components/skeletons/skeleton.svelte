<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();
</script>

<!-- Bloque de carga; el pulso se detiene con movimiento reducido -->
<div
	aria-hidden="true"
	class={cn(
		'animate-pulse rounded-lg bg-light-one_d motion-reduce:animate-none dark:bg-dark-one_d',
		className
	)}
></div>
