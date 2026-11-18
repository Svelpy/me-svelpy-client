<script lang="ts">
	import {
		ClosingSection,
		FaqSection,
		FeaturesSection,
		HeroSection,
		HowItWorksSection,
		LandingFooter,
		LandingNavbar,
		LandingSeo,
		ProblemSection,
		SectorsSection,
		SeoGeoSection
	} from '#lib/components/features/landing/index.ts';
</script>

<LandingSeo />

<div class="bg-white font-sans text-primary-900 antialiased">
	<a
		href="#contenido"
		class="sr-only rounded-full bg-secondary px-5 py-3 font-semibold text-primary-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
	>
		Saltar al contenido
	</a>

	<LandingNavbar />

	<main id="contenido">
		<HeroSection />
		<ProblemSection />
		<FeaturesSection />
		<SeoGeoSection />
		<SectorsSection />
		<HowItWorksSection />
		<FaqSection />
		<ClosingSection />
	</main>

	<LandingFooter />
</div>
