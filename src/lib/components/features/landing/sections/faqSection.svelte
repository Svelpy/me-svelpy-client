<script lang="ts">
	import { PlusIcon } from '#lib/icons/outline/index.ts';
	import { LandingSection, SectionHeader } from '../ui/index.ts';
	import { FAQ, LANDING_LINKS } from '../landing.content.ts';

	const consultaExterno = LANDING_LINKS.consulta.startsWith('http');
</script>

<LandingSection id="preguntas" labelledby="preguntas-titulo">
	<div class="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
		<div>
			<SectionHeader id="preguntas-titulo" title="Preguntas frecuentes" />
			<p class="mt-5 text-primary-600">
				¿Tienes otra duda?
				<!-- eslint-disable svelte/no-navigation-without-resolve -- WhatsApp o ancla: no es una ruta de la app -->
				<a
					href={LANDING_LINKS.consulta}
					target={consultaExterno ? '_blank' : undefined}
					rel={consultaExterno ? 'noopener noreferrer' : undefined}
					class="font-semibold text-primary-900 underline decoration-secondary decoration-2 underline-offset-4 hover:decoration-primary-900"
				>
					Escríbenos por WhatsApp
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</p>
		</div>

		<div class="border-t border-primary-200">
			{#each FAQ as item (item.pregunta)}
				<details name="preguntas-frecuentes" class="group border-b border-primary-200">
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-lg leading-snug font-bold tracking-[-0.01em] text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-900 [&::-webkit-details-marker]:hidden"
					>
						{item.pregunta}
						<span
							class="grid size-9 shrink-0 place-items-center rounded-full bg-primary-100 transition-colors group-open:bg-secondary"
							aria-hidden="true"
						>
							<PlusIcon
								class="size-4 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
							/>
						</span>
					</summary>
					<p class="max-w-[62ch] pr-12 pb-7 leading-relaxed text-primary-600">{item.respuesta}</p>
				</details>
			{/each}
		</div>
	</div>
</LandingSection>
