<!--
	Los 3 pasos se dibujan como las 3 barras de la "E" del isotipo: la del medio en naranja.
-->
<script lang="ts">
	import { cn } from '#lib/utils/cn.ts';
	import { LandingSection, SectionHeader } from '../ui/index.ts';
	import { PASOS } from '../landing.content.ts';
</script>

<LandingSection id="como-funciona" labelledby="como-funciona-titulo" tone="mist">
	<SectionHeader id="como-funciona-titulo" title={PASOS.titulo} />

	<ol class="mt-14 space-y-5">
		{#each PASOS.items as paso, i (paso.titulo)}
			{@const central = i === 1}
			<li
				class="grid grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14"
			>
				<div
					class={cn(
						'flex min-h-[4.75rem] items-center gap-4 rounded-full py-3 pr-8 pl-3',
						central ? 'bg-secondary text-primary-950' : 'bg-primary-900 text-white'
					)}
				>
					<span
						aria-hidden="true"
						class={cn(
							'grid size-[3.25rem] shrink-0 place-items-center rounded-full font-display text-xl font-bold',
							central ? 'bg-primary-950 text-secondary' : 'bg-white/10 text-white'
						)}
					>
						{i + 1}
					</span>
					<h3 class="font-display text-lg leading-tight font-bold tracking-[-0.01em] sm:text-xl">
						{paso.titulo}
					</h3>
				</div>
				<p class="px-4 leading-relaxed text-pretty text-primary-600 lg:px-0">{paso.texto}</p>
			</li>
		{/each}
	</ol>
</LandingSection>
