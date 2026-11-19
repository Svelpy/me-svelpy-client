<script lang="ts">
	import Skeleton from './skeleton.svelte';

	interface Props {
		filas?: number;
		columnas?: number;
		/** Qué se carga, para lectores de pantalla */
		etiqueta?: string;
	}

	let { filas = 6, columnas = 4, etiqueta = 'Cargando la lista' }: Props = $props();
</script>

<div
	role="status"
	class="overflow-hidden rounded-2xl border border-light-four/40 dark:border-dark-one_d"
>
	<span class="sr-only">{etiqueta}</span>
	<div
		class="flex gap-6 border-b border-light-four/40 bg-light-one_d/60 px-4 py-3.5 dark:border-dark-one_d dark:bg-dark-one_d/40"
	>
		{#each { length: columnas } as _, c (c)}
			<Skeleton class="h-3 flex-1 {c === 0 ? 'max-w-40' : 'max-w-24'}" />
		{/each}
	</div>
	{#each { length: filas } as _, f (f)}
		<div
			class="flex items-center gap-6 border-b border-light-four/30 px-4 py-4 last:border-0 dark:border-dark-one_d"
		>
			<Skeleton class="size-9 shrink-0 rounded-full" />
			{#each { length: columnas } as _, c (c)}
				<Skeleton class="h-3.5 flex-1 {c === 0 ? 'max-w-52' : 'max-w-28'}" />
			{/each}
		</div>
	{/each}
</div>
