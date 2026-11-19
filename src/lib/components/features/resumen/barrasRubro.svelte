<!--
	Tarjetas por rubro: barras horizontales ordenadas, una sola serie (un solo color, el de la tinta
	del panel). Cada fila filtra el directorio por ese rubro. El nombre y la cifra van en texto, así
	que nada depende de leer el largo de la barra ni el color.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatNumber } from '#lib/utils/format.ts';

	interface Props {
		filas: { rubro: string; total: number }[];
	}

	let { filas }: Props = $props();

	const maximo = $derived(Math.max(1, ...filas.map((f) => f.total)));
</script>

<ol class="space-y-3.5">
	{#each filas as fila (fila.rubro)}
		<li>
			<a
				href="{resolve('/panel/tarjetas')}?q={encodeURIComponent(fila.rubro)}"
				class="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-light-three dark:focus-visible:outline-dark-three"
			>
				<span class="flex items-baseline justify-between gap-3 text-sm">
					<span class="truncate text-light-two dark:text-dark-two">{fila.rubro}</span>
					<span class="shrink-0 font-semibold text-light-two tabular-nums dark:text-dark-two">
						{formatNumber(fila.total)}
						<span class="sr-only">{fila.total === 1 ? 'tarjeta' : 'tarjetas'}</span>
					</span>
				</span>
				<!-- Pista del mismo tono, más clara; barra fina con el extremo de datos redondeado -->
				<span
					class="mt-1.5 block h-1.5 rounded-r-[4px] bg-light-one_d dark:bg-dark-one_d"
					aria-hidden="true"
				>
					<span
						class="block h-full rounded-r-[4px] bg-light-three transition-[filter] group-hover:brightness-150 dark:bg-dark-three dark:group-hover:brightness-110"
						style:width="{(fila.total / maximo) * 100}%"
					></span>
				</span>
			</a>
		</li>
	{/each}
</ol>
