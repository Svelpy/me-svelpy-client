<script lang="ts">
	import Skeleton from './skeleton.svelte';
	import DirectorioSkeleton from './directorioSkeleton.svelte';
</script>

<div role="status" class="space-y-10">
	<span class="sr-only">Cargando el resumen</span>
	<div class="flex flex-wrap gap-x-10 gap-y-4">
		{#each { length: 4 } as _, i (i)}
			<div>
				<Skeleton class="h-8 w-14" />
				<Skeleton class="mt-2 h-3 w-24" />
			</div>
		{/each}
	</div>
	<div class="grid gap-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
		<DirectorioSkeleton cantidad={3} />
		<div class="space-y-3">
			{#each { length: 6 } as _, i (i)}
				<Skeleton class="h-6" />
			{/each}
		</div>
	</div>
</div>
