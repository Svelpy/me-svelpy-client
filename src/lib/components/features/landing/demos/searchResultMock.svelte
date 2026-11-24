<!--
	Ilustración genérica de un resultado de buscador para un perfil ME (no imita la marca de ningún
	buscador): consulta, nombre, especialidad, ubicación, servicios y enlace al perfil.
-->
<script lang="ts">
	import { MapPinIcon, SearchIcon } from '#lib/icons/outline/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { ME_DOMINIO } from '../landing.content.ts';

	let { class: className = '' }: { class?: string } = $props();

	const servicios = ['Diseño de sonrisa', 'Blanqueamiento', 'Ortodoncia invisible'];
</script>

<figure class={cn('rounded-[1.75rem] bg-white p-5 text-primary-900 sm:p-6', className)}>
	<figcaption class="sr-only">
		Ejemplo de un buscador: al buscar «odontóloga estética cerca de mí» aparece el perfil ME de la
		Dra. Camila Rivas con su especialidad, ubicación, servicios y enlace.
	</figcaption>
	<div
		class="flex h-11 items-center gap-2.5 rounded-full border border-primary-200 px-4 text-sm text-primary-700"
		aria-hidden="true"
	>
		<SearchIcon class="size-4 shrink-0 text-primary-500" />
		<span class="truncate">odontóloga estética cerca de mí</span>
	</div>

	<div class="mt-5" aria-hidden="true">
		<div class="flex items-center gap-2.5">
			<span
				class="grid size-7 shrink-0 place-items-center rounded-full bg-[#0F766E] text-[10px] font-bold text-white"
			>
				CR
			</span>
			<div class="min-w-0 leading-tight">
				<p class="text-sm">Dra. Camila Rivas</p>
				<p class="truncate text-xs text-primary-600">{ME_DOMINIO} › dra-camila-rivas</p>
			</div>
		</div>

		<p
			class="mt-2.5 font-display text-lg leading-snug font-bold tracking-[-0.01em] text-[#0F766E] underline decoration-[#0F766E]/30 underline-offset-4"
		>
			Dra. Camila Rivas | Odontóloga estética
		</p>
		<p class="mt-1.5 flex items-start gap-1.5 text-sm text-primary-700">
			<MapPinIcon class="mt-0.5 size-4 shrink-0 text-primary-500" />
			Clínica Sonríe, consultorios en zona Centro y zona Norte
		</p>
		<p class="mt-1 text-sm leading-relaxed text-primary-600">
			Turnos de lunes a sábado y reserva por WhatsApp desde su perfil.
		</p>
		<ul class="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-primary-700">
			{#each servicios as servicio (servicio)}
				<li class="rounded-full bg-primary-100 px-3 py-1.5">{servicio}</li>
			{/each}
		</ul>
	</div>
</figure>
