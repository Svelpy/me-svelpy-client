<!-- Semana de atención: franjas por día (un día sin franjas = cerrado) -->
<script lang="ts">
	import { DIA_SEMANA_LABEL, DIAS_SEMANA } from '#lib/constants/data.ts';
	import { PlusIcon, XIcon } from '#lib/icons/outline/index.ts';
	import type { DiaSemana, UbicacionHorarioInput } from '#lib/interfaces/index.ts';

	interface Props {
		horarios: UbicacionHorarioInput[];
		/** Errores con la ruta de zod: `horarios.3.hora_fin` */
		errores: Record<string, string>;
	}

	let { horarios = $bindable(), errores }: Props = $props();

	function agregar(dia: DiaSemana) {
		const delDia = horarios.filter((h) => h.dia_semana === dia);
		const ultima = delDia[delDia.length - 1];
		horarios = [
			...horarios,
			ultima
				? { dia_semana: dia, hora_inicio: ultima.hora_fin, hora_fin: '20:00' }
				: { dia_semana: dia, hora_inicio: '09:00', hora_fin: '18:00' }
		];
	}

	function quitar(indice: number) {
		horarios = horarios.filter((_, i) => i !== indice);
	}

	/** Repite las franjas del lunes de martes a viernes */
	function copiarLunes() {
		const lunes = horarios.filter((h) => h.dia_semana === 1);
		horarios = [
			...horarios.filter((h) => h.dia_semana === 1 || h.dia_semana > 5),
			...([2, 3, 4, 5] as DiaSemana[]).flatMap((dia) =>
				lunes.map((franja) => ({ ...franja, dia_semana: dia }))
			)
		];
	}

	const errorDe = (indice: number) =>
		errores[`horarios.${indice}.hora_fin`] ?? errores[`horarios.${indice}.hora_inicio`];

	const claseHora =
		'h-9 w-[6.5rem] rounded-lg border border-light-four bg-light-one px-2 text-sm tabular-nums text-light-two focus:border-light-three focus:ring-2 focus:ring-light-three/15 dark:border-dark-four dark:bg-dark-one dark:text-dark-two dark:focus:border-dark-three';
</script>

<fieldset>
	<legend class="text-sm font-medium text-light-two dark:text-dark-two">
		Horarios de atención
	</legend>
	<p class="mt-0.5 text-xs text-light-two_d dark:text-dark-two_d">
		Un día sin horarios se muestra como cerrado.
	</p>
	<ul
		class="mt-3 divide-y divide-light-four/40 rounded-2xl border border-light-four/40 dark:divide-dark-one_d dark:border-dark-one_d"
	>
		{#each DIAS_SEMANA as dia (dia)}
			{@const franjas = horarios
				.map((franja, indice) => ({ franja, indice }))
				.filter(({ franja }) => franja.dia_semana === dia)}
			<li class="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-start">
				<span class="w-24 shrink-0 pt-1.5 text-sm font-medium text-light-two dark:text-dark-two">
					{DIA_SEMANA_LABEL[dia]}
				</span>
				<div class="min-w-0 flex-1 space-y-2">
					{#each franjas as { franja, indice } (indice)}
						<div>
							<div class="flex items-center gap-2">
								<input
									type="time"
									step="300"
									class={claseHora}
									aria-label="{DIA_SEMANA_LABEL[dia]}, desde"
									bind:value={horarios[indice].hora_inicio}
								/>
								<span class="text-sm text-light-two_d dark:text-dark-two_d">a</span>
								<input
									type="time"
									step="300"
									class={claseHora}
									aria-label="{DIA_SEMANA_LABEL[dia]}, hasta"
									bind:value={horarios[indice].hora_fin}
								/>
								<button
									type="button"
									onclick={() => quitar(indice)}
									aria-label="Quitar el horario de {franja.hora_inicio} del {DIA_SEMANA_LABEL[
										dia
									].toLowerCase()}"
									class="grid size-8 place-items-center rounded-lg text-light-two_d hover:bg-light-one_d hover:text-light-error dark:text-dark-two_d dark:hover:bg-dark-one_d dark:hover:text-dark-error"
								>
									<XIcon class="size-4" />
								</button>
							</div>
							{#if errorDe(indice)}
								<p class="mt-1 text-xs font-medium text-light-error dark:text-dark-error">
									{errorDe(indice)}
								</p>
							{/if}
						</div>
					{:else}
						<p class="pt-1.5 text-sm text-light-four_d dark:text-dark-four_d">Cerrado</p>
					{/each}
				</div>
				<button
					type="button"
					onclick={() => agregar(dia)}
					class="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg px-2.5 text-sm font-medium text-light-two_d hover:bg-light-one_d hover:text-light-two dark:text-dark-two_d dark:hover:bg-dark-one_d dark:hover:text-dark-two"
				>
					<PlusIcon class="size-4" />
					<span class="sr-only">Agregar horario el {DIA_SEMANA_LABEL[dia].toLowerCase()}</span>
					<span aria-hidden="true">Horario</span>
				</button>
			</li>
		{/each}
	</ul>
	{#if horarios.some((h) => h.dia_semana === 1)}
		<button
			type="button"
			onclick={copiarLunes}
			class="mt-2 text-sm font-medium text-light-two_d underline decoration-light-four underline-offset-4 hover:text-light-two dark:text-dark-two_d dark:decoration-dark-four dark:hover:text-dark-two"
		>
			Repetir el horario del lunes de martes a viernes
		</button>
	{/if}
</fieldset>
