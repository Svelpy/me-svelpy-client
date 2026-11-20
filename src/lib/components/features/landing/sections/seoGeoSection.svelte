<!--
	El único bloque naranja de la página: texto ciruela sobre #FF4724 (5,3:1, AA).
-->
<script lang="ts">
	import AiAnswerMock from '../demos/aiAnswerMock.svelte';
	import SearchResultMock from '../demos/searchResultMock.svelte';
	import { SEO_GEO } from '../landing.content.ts';
</script>

<section
	id="seo-geo"
	aria-labelledby="seo-geo-titulo"
	class="relative bg-secondary py-20 text-primary-950 sm:py-28"
>
	<div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
		<header class="max-w-3xl">
			<h2
				id="seo-geo-titulo"
				class="font-display text-[2rem] leading-[1.02] font-bold tracking-[-0.035em] text-balance sm:text-[3.25rem]"
			>
				{SEO_GEO.titulo}
			</h2>
			<p class="mt-5 max-w-[58ch] text-lg leading-relaxed text-pretty">{SEO_GEO.subtitulo}</p>
		</header>

		<div class="mt-14 grid gap-4 lg:grid-cols-2">
			<SearchResultMock />
			<AiAnswerMock />
		</div>
	</div>
</section>
