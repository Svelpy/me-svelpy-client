<script lang="ts">
	import Skeleton from './skeleton.svelte';
	import FormularioSkeleton from './formularioSkeleton.svelte';
</script>

<!-- Mismo trazado que el editor: secciones, formulario y espejo -->
<div
	role="status"
	class="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_22rem]"
>
	<span class="sr-only">Cargando la tarjeta</span>
	<div class="hidden space-y-2 lg:block">
		{#each { length: 12 } as _, i (i)}
			<Skeleton class="h-9 {i === 3 ? 'mt-6' : ''}" />
		{/each}
	</div>
	<div>
		<Skeleton class="h-7 w-48" />
		<Skeleton class="mt-2 h-4 w-72" />
		<FormularioSkeleton class="mt-8" campos={5} />
	</div>
	<div class="hidden xl:block">
		<Skeleton class="mx-auto aspect-[9/19] w-full max-w-[20rem] rounded-[2.5rem]" />
	</div>
</div>
