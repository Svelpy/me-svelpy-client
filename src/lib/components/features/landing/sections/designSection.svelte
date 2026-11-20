<script lang="ts">
	import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
	import PaletteDemo from '../demos/paletteDemo.svelte';
	import { LandingSection, SectionHeader } from '../ui/index.ts';
	import { DISENO } from '../landing.content.ts';
</script>

<LandingSection id="diseno" labelledby="diseno-titulo" tone="mist">
	<div
		class="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
	>
		<SectionHeader id="diseno-titulo" title={DISENO.titulo} subtitle={DISENO.subtitulo} />
		<PaletteDemo temas={TEMAS_TARJETA} nota={DISENO.nota} class="w-full max-w-md lg:ml-auto" />
	</div>
</LandingSection>
