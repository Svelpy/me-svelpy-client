<script lang="ts">
	import Skeleton from './skeleton.svelte';
</script>

<!-- Silueta neutra de una tarjeta (aún no se conocen sus colores) -->
<div role="status" class="min-h-full bg-light-one dark:bg-dark-one">
	<span class="sr-only">Cargando la tarjeta</span>
	<Skeleton class="h-36 rounded-none" />
	<div class="-mt-12 flex flex-col items-center px-5">
		<Skeleton class="size-24 rounded-full ring-4 ring-light-one dark:ring-dark-one" />
		<Skeleton class="mt-4 h-6 w-48" />
		<Skeleton class="mt-2 h-4 w-32" />
		<Skeleton class="mt-5 h-12 w-full rounded-full" />
		<div class="mt-5 flex w-full justify-around">
			{#each { length: 4 } as _, i (i)}
				<Skeleton class="size-12 rounded-full" />
			{/each}
		</div>
		<Skeleton class="mt-6 h-3 w-full" />
		<Skeleton class="mt-2 h-3 w-5/6" />
		<Skeleton class="mt-6 h-24 w-full rounded-2xl" />
	</div>
</div>
