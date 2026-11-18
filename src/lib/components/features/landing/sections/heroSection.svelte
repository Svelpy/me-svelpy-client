<script lang="ts">
	import { CheckIcon, WhatsappIcon } from '#lib/icons/outline/index.ts';
	import ProfileShowcase from '../demos/profileShowcase.svelte';
	import { LandingButton } from '../ui/index.ts';
	import { HERO, LANDING_LINKS } from '../landing.content.ts';

	// El titular se parte tras los dos puntos: lo que hoy pasa (te guardan) y lo que ME promete.
	const [antes, despues] = HERO.titulo.split(': ');
	const crearExterno = LANDING_LINKS.crearMe.startsWith('http');
</script>

<section
	id="inicio"
	aria-labelledby="hero-titulo"
	class="relative overflow-hidden bg-primary-950 pt-28 pb-20 text-white sm:pt-36 lg:pb-28"
>
	<div
		class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-8 lg:px-8"
	>
		<div>
			<h1
				id="hero-titulo"
				class="font-display text-[2.6rem] leading-[0.98] font-bold tracking-[-0.04em] text-balance sm:text-6xl lg:text-[4.25rem] lg:text-wrap"
			>
				<span class="block">{antes}:</span>
				<span class="block">{despues}</span>
			</h1>

			<p class="mt-7 max-w-[56ch] text-lg leading-relaxed text-pretty text-primary-300">
				{HERO.subtitulo}
			</p>

			<div class="mt-10 flex flex-col gap-3 sm:flex-row">
				<LandingButton href={LANDING_LINKS.crearMe} external={crearExterno} tone="dark" size="lg">
					<WhatsappIcon class="size-5" />
					{HERO.ctaPrimario}
				</LandingButton>
				<LandingButton
					href={LANDING_LINKS.perfilesEjemplo}
					variant="secondary"
					tone="dark"
					size="lg"
				>
					{HERO.ctaSecundario}
				</LandingButton>
			</div>

			<ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-primary-300">
				{#each HERO.garantias as garantia (garantia)}
					<li class="flex items-center gap-2">
						<CheckIcon class="size-4 text-secondary" />
						{garantia}
					</li>
				{/each}
			</ul>
		</div>

		<ProfileShowcase perfiles={HERO.perfiles} />
	</div>
</section>
