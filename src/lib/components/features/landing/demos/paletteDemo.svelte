<!--
	Demo interactiva: elegir un color de marca y ver cómo cambia la cabecera de un perfil.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { cn } from '#lib/utils/cn.ts';
	import type { ColorMarca } from '../landing.content.ts';

	interface Props {
		colores: ColorMarca[];
		class?: string;
	}

	let { colores, class: className = '' }: Props = $props();

	let seleccion = $state(untrack(() => colores[0]?.nombre ?? ''));
	const color = $derived(colores.find((c) => c.nombre === seleccion) ?? colores[0]);
</script>

<div class={cn('flex flex-col gap-5', className)}>
	<!-- Vista previa -->
	<div
		class="overflow-hidden rounded-3xl border border-primary-200 bg-white"
		data-testid="palette-preview"
		style:--marca={color?.fondo}
		style:--acento={color?.acento}
		aria-hidden="true"
	>
		<div
			class="h-20 bg-(--marca) transition-colors duration-300 motion-reduce:transition-none"
			style="background-image: repeating-linear-gradient(-35deg, transparent 0 18px, rgb(255 255 255 / 0.08) 18px 36px)"
		></div>
		<div class="-mt-9 flex flex-col items-center px-5 pb-5">
			<span
				class="grid size-[72px] place-items-center rounded-full border-4 border-white bg-(--acento) font-display text-xl font-bold text-(--marca) transition-colors duration-300 motion-reduce:transition-none"
			>
				TN
			</span>
			<p
				class="mt-2 font-display text-lg font-bold text-(--marca) transition-colors duration-300 motion-reduce:transition-none"
			>
				Tu nombre
			</p>
			<p class="text-xs text-primary-600">Tu especialidad</p>
			<span
				class="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-(--marca) text-sm font-semibold text-white transition-colors duration-300 motion-reduce:transition-none"
			>
				Guardar contacto
			</span>
		</div>
	</div>

	<!-- Selector -->
	<fieldset>
		<legend class="mb-3 text-sm font-semibold text-primary-900">
			Prueba un color: <span class="font-normal text-primary-600">{color?.nombre}</span>
		</legend>
		<div class="flex flex-wrap gap-2.5">
			{#each colores as opcion (opcion.nombre)}
				<label class="relative cursor-pointer">
					<input
						type="radio"
						name="color-marca"
						value={opcion.nombre}
						bind:group={seleccion}
						class="peer sr-only"
					/>
					<span class="sr-only">{opcion.nombre}</span>
					<span
						aria-hidden="true"
						class="flex size-10 overflow-hidden rounded-full ring-2 ring-transparent ring-offset-2 transition-shadow peer-checked:ring-primary-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-secondary"
					>
						<span class="h-full w-2/3" style:background={opcion.fondo}></span>
						<span class="h-full w-1/3" style:background={opcion.acento}></span>
					</span>
				</label>
			{/each}
		</div>
	</fieldset>
</div>
