<script lang="ts">
	import { AlertBox } from '#lib/components/ui/index.ts';
	import type { TarjetaThemeColores } from '#lib/interfaces/index.ts';
	import { paresConContrasteBajo } from '#lib/utils/color.ts';

	interface Props {
		colores: TarjetaThemeColores;
	}

	let { colores }: Props = $props();

	const bajos = $derived(paresConContrasteBajo(colores));
	const formato = new Intl.NumberFormat('es', { maximumFractionDigits: 1 });
</script>

<!-- Los mismos mínimos que se exigen a los presets (WCAG): texto 4,5:1, íconos 3:1 -->
{#if bajos.length > 0}
	<AlertBox variant="warning" title="Algunas combinaciones cuestan leerse">
		<ul class="mt-1 space-y-0.5">
			{#each bajos as par (`${par.texto}-${par.fondo}`)}
				<li>
					{par.descripcion}: {formato.format(par.valor)}:1 (mínimo {formato.format(par.minimo)}:1)
				</li>
			{/each}
		</ul>
	</AlertBox>
{:else}
	<p class="text-sm text-light-two_d dark:text-dark-two_d" role="status">
		Todas las combinaciones se leen bien.
	</p>
{/if}
