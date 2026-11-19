<script lang="ts">
	import type { TarjetaEducacion } from '#lib/interfaces/index.ts';
	import { anioDe, ordenar } from '#lib/utils/tarjeta.ts';
	import TarjetaSeccion from '../ui/tarjetaSeccion.svelte';

	interface Props {
		titulo: string;
		educacion: TarjetaEducacion[];
	}

	let { titulo, educacion }: Props = $props();

	const visibles = $derived(ordenar(educacion).filter((e) => e.is_visible));

	function periodo(estudio: TarjetaEducacion): string | null {
		const inicio = anioDe(estudio.fecha_inicio);
		const fin = estudio.is_actual ? 'actualidad' : anioDe(estudio.fecha_fin);
		if (inicio && fin) return inicio === fin ? inicio : `${inicio}–${fin}`;
		return inicio ?? fin;
	}
</script>

<TarjetaSeccion id="educacion" {titulo}>
	<!-- Línea de tiempo: el orden es el que eligió el profesional -->
	<ol class="space-y-5 border-l-2 border-t-borde pl-5">
		{#each visibles as estudio (estudio.id)}
			<li class="relative">
				<span
					class="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-t-primario"
					aria-hidden="true"
				></span>
				<p class="font-semibold text-t-titulo">{estudio.titulo ?? estudio.institucion}</p>
				{#if estudio.titulo}<p class="text-t-texto">{estudio.institucion}</p>{/if}
				{#if estudio.area_estudio}<p class="text-sm text-t-texto-sec">
						{estudio.area_estudio}
					</p>{/if}
				{#if periodo(estudio)}<p class="mt-0.5 text-sm text-t-texto-sec tabular-nums">
						{periodo(estudio)}
					</p>{/if}
				{#if estudio.descripcion}<p class="mt-1 text-sm text-t-texto">{estudio.descripcion}</p>{/if}
			</li>
		{/each}
	</ol>
</TarjetaSeccion>
