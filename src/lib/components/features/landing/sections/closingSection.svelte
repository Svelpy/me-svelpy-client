<script lang="ts">
	import { WhatsappIcon } from '#lib/icons/outline/index.ts';
	import { LandingButton } from '../ui/index.ts';
	import { CIERRE, LANDING_LINKS, LOGOS } from '../landing.content.ts';

	const externo = (href: string) => href.startsWith('http');
</script>

<section
	id="contacto"
	aria-labelledby="cierre-titulo"
	class="relative overflow-hidden bg-primary-950 py-24 text-white sm:py-32"
>
	<!-- Isotipo a gran escala: barras ciruela casi invisibles, cápsulas naranjas encendidas -->
	<img
		src={LOGOS.isotipoClaro}
		alt=""
		width="786"
		height="458"
		class="pointer-events-none absolute top-1/2 -right-60 hidden h-95 w-auto -translate-y-1/2 min-[1400px]:block"
	/>

	<div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<h2
			id="cierre-titulo"
			class="max-w-3xl font-display text-[2.25rem] leading-[1.02] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-[3.5rem]"
		>
			{CIERRE.titulo}
		</h2>
		<p class="mt-6 max-w-xl text-lg leading-relaxed text-primary-300">{CIERRE.subtitulo}</p>
		<div class="mt-10 flex flex-col gap-3 sm:flex-row">
			<LandingButton
				href={LANDING_LINKS.crearMe}
				external={externo(LANDING_LINKS.crearMe)}
				tone="dark"
				size="lg"
			>
				<WhatsappIcon class="size-5" />
				{CIERRE.ctaPrimario}
			</LandingButton>
			<LandingButton href={LANDING_LINKS.perfilesEjemplo} variant="secondary" tone="dark" size="lg">
				{CIERRE.ctaSecundario}
			</LandingButton>
		</div>
	</div>
</section>
