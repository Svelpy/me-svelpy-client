<script lang="ts">
	import ProfileShowcase from '../demos/profileShowcase.svelte';
	import { AlternativaWhatsapp, ReservaEnlace } from '../ui/index.ts';
	import { HERO } from '../landing.content.ts';
</script>

<section
	id="inicio"
	aria-labelledby="hero-titulo"
	class="relative overflow-hidden bg-primary-950 pt-28 pb-20 text-white sm:pt-36 lg:pb-28"
>
	<div
		class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8 lg:px-8"
	>
		<div>
			<h1
				id="hero-titulo"
				class="max-w-[13ch] font-display text-[2.75rem] leading-[0.96] font-bold tracking-[-0.045em] text-balance sm:text-[4rem] lg:text-[4.75rem]"
			>
				{HERO.titulo}
			</h1>

			<p class="mt-7 max-w-[46ch] text-lg leading-relaxed text-pretty text-primary-300">
				{HERO.subtitulo}
			</p>

			<ReservaEnlace class="mt-10" />
			<p class="mt-3.5 pl-6 text-sm text-primary-400">{HERO.notaGratis}</p>

			<AlternativaWhatsapp class="mt-10 border-t border-white/10 pt-6" />
		</div>

		<ProfileShowcase perfiles={HERO.perfiles} />
	</div>
</section>
