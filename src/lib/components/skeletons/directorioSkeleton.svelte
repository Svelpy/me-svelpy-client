<script lang="ts">
	import Skeleton from './skeleton.svelte';

	interface Props {
		cantidad?: number;
	}

	let { cantidad = 8 }: Props = $props();
</script>

<!-- Mismo trazado que el muro de mini-tarjetas -->
<div role="status" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
	<span class="sr-only">Cargando las tarjetas</span>
	{#each { length: cantidad } as _, i (i)}
		<div
			class="overflow-hidden rounded-[1.25rem] border border-light-four/40 dark:border-dark-one_d"
		>
			<Skeleton class="h-20 rounded-none" />
			<div class="-mt-7 flex flex-col items-center px-4 pb-5">
				<Skeleton class="size-14 rounded-full ring-4 ring-light-one dark:ring-dark-one" />
				<Skeleton class="mt-3 h-4 w-36" />
				<Skeleton class="mt-2 h-3 w-24" />
				<Skeleton class="mt-4 h-3 w-40" />
			</div>
		</div>
	{/each}
</div>
