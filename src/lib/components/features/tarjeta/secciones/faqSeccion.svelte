<script lang="ts">
	import { ChevronDownIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaFaqPublica } from '#lib/interfaces/index.ts';
	import TarjetaSeccion from '../ui/tarjetaSeccion.svelte';

	interface Props {
		titulo: string;
		faqs: TarjetaFaqPublica[];
	}

	let { titulo, faqs }: Props = $props();
	const grupo = $props.id();
</script>

<TarjetaSeccion id="faq" {titulo}>
	<!-- <details name> abre una pregunta a la vez sin JavaScript -->
	<div class="space-y-2">
		{#each faqs as pregunta (pregunta.id)}
			<details name={grupo} class="group rounded-2xl border border-t-borde bg-t-superficie">
				<summary
					class="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3.5 font-semibold text-t-titulo marker:content-none focus-visible:outline-2 focus-visible:outline-t-primario [&::-webkit-details-marker]:hidden"
				>
					{pregunta.pregunta}
					<ChevronDownIcon
						class="size-5 shrink-0 text-t-texto-sec transition-transform group-open:rotate-180 motion-reduce:transition-none"
					/>
				</summary>
				<p class="px-4 pb-4 leading-relaxed whitespace-pre-line text-t-texto">
					{pregunta.respuesta}
				</p>
			</details>
		{/each}
	</div>
</TarjetaSeccion>
