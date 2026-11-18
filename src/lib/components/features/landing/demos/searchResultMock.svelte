<!--
	Ilustración genérica de un resultado de buscador para un perfil ME (no imita la marca de ningún buscador).
-->
<script lang="ts">
	import { SearchIcon } from '#lib/icons/outline/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { ME_DOMINIO } from '../landing.content.ts';

	let { class: className = '' }: { class?: string } = $props();
</script>

<figure class={cn('rounded-[1.75rem] bg-white p-5 text-primary-900 sm:p-6', className)}>
	<figcaption class="sr-only">Ejemplo: el perfil ME aparece al buscar la especialidad</figcaption>
	<div
		class="flex h-11 items-center gap-2.5 rounded-full border border-primary-200 px-4 text-sm text-primary-700"
	>
		<SearchIcon class="size-4 shrink-0 text-primary-500" />
		<span class="truncate">odontóloga estética cerca de mí</span>
	</div>

	<div class="mt-5">
		<div class="flex items-center gap-2.5">
			<span
				class="grid size-7 shrink-0 place-items-center rounded-full bg-[#0F766E] text-[10px] font-bold text-white"
				aria-hidden="true"
			>
				CS
			</span>
			<div class="min-w-0 leading-tight">
				<p class="text-sm">Clínica Sonríe</p>
				<p class="truncate font-mono text-[11px] text-primary-600">
					{ME_DOMINIO} › dra-camila-rivas
				</p>
			</div>
		</div>
		<p class="mt-2.5 font-display text-lg leading-snug font-bold tracking-[-0.01em] text-[#0F766E]">
			Dra. Camila Rivas | Odontóloga y estética dental
		</p>
		<p class="mt-1 text-sm leading-relaxed text-primary-600">
			Diseño de sonrisa, blanqueamiento y ortodoncia invisible. Dos consultorios, turnos de lunes a
			sábado y reserva por WhatsApp.
		</p>
		<ul class="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-primary-700">
			<li class="rounded-full bg-primary-100 px-3 py-1.5">Guardar contacto</li>
			<li class="rounded-full bg-primary-100 px-3 py-1.5">Tratamientos</li>
			<li class="rounded-full bg-primary-100 px-3 py-1.5">Ubicación</li>
		</ul>
	</div>
</figure>
