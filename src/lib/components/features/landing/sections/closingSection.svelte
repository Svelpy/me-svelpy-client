<script lang="ts">
	import { AlternativaWhatsapp, ReservaEnlace } from '../ui/index.ts';
	import { CIERRE, HERO, LOGOS } from '../landing.content.ts';
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
			class="max-w-[14ch] font-display text-[2.5rem] leading-[0.98] font-bold tracking-[-0.04em] text-balance sm:text-6xl lg:text-[4.25rem]"
		>
			{CIERRE.titulo}
		</h2>
		<ReservaEnlace class="mt-10" />
		<p class="mt-3.5 pl-6 text-sm text-primary-400">{HERO.notaGratis}</p>
		<AlternativaWhatsapp class="mt-10 border-t border-white/10 pt-6" />
	</div>
</section>
