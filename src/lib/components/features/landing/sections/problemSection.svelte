<script lang="ts">
	import { CapsuleMarker, LandingSection, SectionHeader } from '../ui/index.ts';
	import { LOGOS, PROBLEMA } from '../landing.content.ts';
</script>

<LandingSection id="problema" labelledby="problema-titulo">
	<SectionHeader id="problema-titulo" title={PROBLEMA.titulo} subtitle={PROBLEMA.subtitulo} />

	<div class="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
		<!-- La tarjeta de papel: esquinas rectas, gris, estática -->
		<article class="rounded-[3px] border border-dashed border-primary-300 bg-primary-50 p-7 sm:p-9">
			<div
				aria-hidden="true"
				class="mb-8 flex h-[92px] w-[156px] -rotate-3 flex-col justify-between border border-primary-200 bg-white p-3"
			>
				<span class="h-2 w-20 bg-primary-200"></span>
				<span class="flex flex-col gap-1.5">
					<span class="h-1.5 w-24 bg-primary-100"></span>
					<span class="relative h-1.5 w-16 bg-primary-100">
						<span class="absolute -inset-x-1 top-1/2 h-[1.5px] -rotate-6 bg-primary-400"></span>
					</span>
					<span class="h-1.5 w-20 bg-primary-100"></span>
				</span>
			</div>
			<h3 class="font-display text-xl font-bold tracking-[-0.01em] text-primary-700">
				{PROBLEMA.antes.titulo}
			</h3>
			<ul class="mt-6 space-y-4">
				{#each PROBLEMA.antes.puntos as punto (punto)}
					<li class="flex gap-3.5 leading-relaxed text-primary-600">
						<CapsuleMarker variant="off" />
						<span>{punto}</span>
					</li>
				{/each}
			</ul>
		</article>

		<!-- ME: cápsulas, color y movimiento -->
		<article class="rounded-[2rem] bg-primary-900 p-7 text-white sm:p-10">
			<img src={LOGOS.isotipoOscuro} alt="" class="mb-8 h-[34px] w-auto" width="58" height="34" />
			<h3 class="font-display text-xl font-bold tracking-[-0.01em]">{PROBLEMA.despues.titulo}</h3>
			<ul class="mt-6 space-y-6">
				{#each PROBLEMA.despues.puntos as punto (punto.titulo)}
					<li class="flex gap-3.5">
						<CapsuleMarker class="text-lg" />
						<div>
							<p class="font-display text-lg font-bold">{punto.titulo}</p>
							<p class="mt-1 leading-relaxed text-primary-300">{punto.texto}</p>
						</div>
					</li>
				{/each}
			</ul>
		</article>
	</div>
</LandingSection>
