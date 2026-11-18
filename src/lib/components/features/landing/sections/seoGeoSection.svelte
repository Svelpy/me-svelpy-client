<script lang="ts">
	import AiAnswerMock from '../demos/aiAnswerMock.svelte';
	import JsonLdSnippet from '../demos/jsonLdSnippet.svelte';
	import SearchResultMock from '../demos/searchResultMock.svelte';
	import { LandingSection, SectionHeader } from '../ui/index.ts';
	import { SEO_GEO } from '../landing.content.ts';
</script>

<LandingSection id="seo-geo" labelledby="seo-geo-titulo" tone="night">
	<SectionHeader id="seo-geo-titulo" title={SEO_GEO.titulo} subtitle={SEO_GEO.cuerpo} tone="dark">
		{#snippet before()}
			<p class="mb-5 font-mono text-sm text-secondary">{SEO_GEO.badge}</p>
		{/snippet}
	</SectionHeader>

	<div class="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-8">
		<div class="flex flex-col">
			<h3 class="font-display text-2xl font-bold tracking-[-0.02em]">{SEO_GEO.seo.titulo}</h3>
			<p class="mt-3 mb-8 max-w-[52ch] leading-relaxed text-primary-300">{SEO_GEO.seo.texto}</p>
			<SearchResultMock class="mt-auto" />
		</div>
		<div class="flex flex-col">
			<h3 class="font-display text-2xl font-bold tracking-[-0.02em]">{SEO_GEO.geo.titulo}</h3>
			<p class="mt-3 mb-8 max-w-[52ch] leading-relaxed text-primary-300">{SEO_GEO.geo.texto}</p>
			<AiAnswerMock class="mt-auto" />
		</div>
	</div>

	<JsonLdSnippet class="mt-8" />
</LandingSection>
