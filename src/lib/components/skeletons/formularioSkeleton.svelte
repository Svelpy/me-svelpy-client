<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';
	import Skeleton from './skeleton.svelte';

	interface Props {
		campos?: number;
		class?: string;
	}

	let { campos = 4, class: className }: Props = $props();
</script>

<div class={cn('space-y-6', className)} aria-hidden="true">
	{#each { length: campos } as _, i (i)}
		<div>
			<Skeleton class="h-3.5 w-28" />
			<Skeleton class="mt-2.5 h-11 rounded-xl" />
		</div>
	{/each}
	<Skeleton class="h-11 w-40 rounded-xl" />
</div>
