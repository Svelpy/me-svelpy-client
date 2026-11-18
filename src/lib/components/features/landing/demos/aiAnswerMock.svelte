<!--
	Ilustración genérica de un asistente de IA que recomienda un perfil ME (sin marca de terceros).
-->
<script lang="ts">
	import { SparklesIcon } from '#lib/icons/outline/index.ts';
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
	<figcaption class="sr-only">Ejemplo: un asistente de IA recomienda el perfil ME</figcaption>
	<p
		class="max-w-[85%] self-end rounded-2xl rounded-br-md bg-white/10 px-4 py-2.5 text-sm leading-relaxed"
	>
		¿Qué odontóloga me recomiendas para un diseño de sonrisa?
	</p>
	<div class="flex gap-3">
		<span
			class="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary-950"
			aria-hidden="true"
		>
			<SparklesIcon class="size-4" />
		</span>
		<div class="text-sm leading-relaxed text-primary-300">
			<p>
				Una buena opción es la <strong class="font-semibold text-white">Dra. Camila Rivas</strong>,
				de Clínica Sonríe. Se especializa en diseño de sonrisa y blanqueamiento, atiende en dos
				consultorios de lunes a sábado y puedes agendar por WhatsApp desde su perfil:
			</p>
			<p
				class="mt-3 inline-flex rounded-full bg-primary-950 px-3 py-1.5 font-mono text-xs text-secondary"
			>
				{ME_DOMINIO}/dra-camila-rivas
			</p>
		</div>
	</div>
</figure>
