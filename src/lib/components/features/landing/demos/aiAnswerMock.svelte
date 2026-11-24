<!--
	Ilustración genérica de un asistente de IA que sugiere un perfil ME (sin marca de terceros):
	pregunta, respuesta y la ficha con nombre, especialidad, ubicación y enlace al perfil.
-->
<script lang="ts">
	import { MapPinIcon, SparklesIcon } from '#lib/icons/outline/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { ME_DOMINIO } from '../landing.content.ts';

	let { class: className = '' }: { class?: string } = $props();
</script>

<figure
	class={cn(
		'flex flex-col gap-4 rounded-[1.75rem] bg-primary-800 p-5 text-white ring-1 ring-primary-700 sm:p-6',
		className
	)}
>
	<figcaption class="sr-only">
		Ejemplo de un asistente de IA: ante la pregunta por una odontóloga para un diseño de sonrisa,
		sugiere a la Dra. Camila Rivas con su especialidad, ubicación y el enlace a su perfil ME.
	</figcaption>
	<p
		class="max-w-[85%] self-end rounded-2xl rounded-br-md bg-white/10 px-4 py-2.5 text-sm leading-relaxed"
		aria-hidden="true"
	>
		¿Qué odontóloga me recomiendas para un diseño de sonrisa?
	</p>
	<div class="flex gap-3" aria-hidden="true">
		<span
			class="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary-950"
		>
			<SparklesIcon class="size-4" />
		</span>
		<div class="min-w-0 flex-1 text-sm leading-relaxed text-primary-300">
			<p>Según la información de su perfil, una opción es:</p>
			<div class="mt-3 rounded-2xl bg-primary-950 p-4">
				<p class="font-display text-base font-bold text-white">Dra. Camila Rivas</p>
				<p>Odontóloga estética, especialista en diseño de sonrisa</p>
				<p class="mt-1.5 flex items-start gap-1.5">
					<MapPinIcon class="mt-1 size-4 shrink-0 text-secondary" />
					Clínica Sonríe, zona Centro y zona Norte
				</p>
				<p class="mt-3 truncate text-xs font-semibold text-secondary">
					{ME_DOMINIO}/dra-camila-rivas
				</p>
			</div>
		</div>
	</div>
</figure>
