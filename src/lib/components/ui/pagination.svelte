<script lang="ts">
	import { ChevronLeftIcon, ChevronRightIcon } from '#lib/icons/outline/index.ts';
	import { formatNumber } from '#lib/utils/format.ts';

	interface Props {
		currentPage: number;
		totalPages: number;
		perPage: number;
		total: number;
		onPageChange: (page: number) => void;
		maxVisiblePages?: number;
		/** Qué se cuenta: "tarjetas", "cuentas" */
		nombre?: string;
	}

	let {
		currentPage,
		totalPages,
		perPage,
		total,
		onPageChange,
		maxVisiblePages = 7,
		nombre = 'resultados'
	}: Props = $props();

	const visiblePages = $derived.by(() => {
		let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		const end = Math.min(totalPages, start + maxVisiblePages - 1);
		start = Math.max(1, end - maxVisiblePages + 1);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	});

	const startItem = $derived(total === 0 ? 0 : (currentPage - 1) * perPage + 1);
	const endItem = $derived(Math.min(currentPage * perPage, total));

	function go(page: number) {
		if (page !== currentPage && page >= 1 && page <= totalPages) onPageChange(page);
	}

	const boton =
		'inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-light-three disabled:cursor-not-allowed disabled:opacity-40 dark:focus-visible:outline-dark-three';
</script>

<nav aria-label="Paginación" class="flex flex-col items-center justify-between gap-3 sm:flex-row">
	<p class="text-sm text-light-two_d dark:text-dark-two_d">
		<span class="tabular-nums">{formatNumber(startItem)}–{formatNumber(endItem)}</span> de
		<span class="tabular-nums">{formatNumber(total)}</span>
		{nombre}
	</p>
	{#if totalPages > 1}
		<ul class="flex items-center gap-1">
			<li>
				<button
					type="button"
					class="{boton} text-light-two hover:bg-light-one_d dark:text-dark-two dark:hover:bg-dark-one_d"
					onclick={() => go(currentPage - 1)}
					disabled={currentPage === 1}
					aria-label="Página anterior"
				>
					<ChevronLeftIcon class="size-4" />
				</button>
			</li>
			{#each visiblePages as page (page)}
				<li>
					<button
						type="button"
						onclick={() => go(page)}
						aria-current={page === currentPage ? 'page' : undefined}
						aria-label="Página {page}"
						class={[
							boton,
							'tabular-nums',
							page === currentPage
								? 'bg-light-three text-light-one dark:bg-dark-three dark:text-dark-one'
								: 'text-light-two hover:bg-light-one_d dark:text-dark-two dark:hover:bg-dark-one_d'
						]}
					>
						{page}
					</button>
				</li>
			{/each}
			<li>
				<button
					type="button"
					class="{boton} text-light-two hover:bg-light-one_d dark:text-dark-two dark:hover:bg-dark-one_d"
					onclick={() => go(currentPage + 1)}
					disabled={currentPage === totalPages}
					aria-label="Página siguiente"
				>
					<ChevronRightIcon class="size-4" />
				</button>
			</li>
		</ul>
	{/if}
</nav>
