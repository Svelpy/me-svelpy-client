<!--
	Las dos formas de tener un ME, lado a lado y con el mismo peso visual: crearla uno mismo
	(registro gratis, plan Free hasta publicar) o pedir que la arme el equipo por WhatsApp.
-->
<script lang="ts">
	import { CheckIcon, WhatsappIcon } from '#lib/icons/outline/index.ts';
	import { LandingButton, LandingSection, SectionHeader } from '../ui/index.ts';
	import { CTA_CREAR, CTA_SOLICITAR, EMPEZAR, LANDING_LINKS } from '../landing.content.ts';

	const titulo = 'font-display text-[1.75rem] leading-tight font-bold tracking-[-0.025em]';
</script>

<LandingSection id="empezar" labelledby="empezar-titulo">
	<SectionHeader id="empezar-titulo" title={EMPEZAR.titulo} />

	<div class="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
		<article
			aria-labelledby="empezar-crear"
			class="flex flex-col rounded-[2rem] bg-primary-50 p-6 ring-1 ring-primary-200 sm:p-10"
		>
			<h3 id="empezar-crear" class="{titulo} text-primary-900">{EMPEZAR.crear.titulo}</h3>
			<p class="mt-2 text-lg text-primary-600">{EMPEZAR.crear.texto}</p>

			<ol class="mt-8 mb-10 flex flex-col gap-4">
				{#each EMPEZAR.crear.pasos as paso, i (paso)}
					<li class="flex items-center gap-4 text-primary-900">
						<span
							class="grid size-9 shrink-0 place-items-center rounded-full bg-primary-900 font-display font-bold text-white"
							aria-hidden="true"
						>
							{i + 1}
						</span>
						{paso}
					</li>
				{/each}
			</ol>

			<LandingButton
				href={LANDING_LINKS.registro}
				size="lg"
				class="mt-auto w-full px-5 sm:w-fit sm:px-7"
			>
				{CTA_CREAR}
			</LandingButton>
		</article>

		<article
			aria-labelledby="empezar-solicitar"
			class="flex flex-col rounded-[2rem] bg-primary-950 p-6 text-white sm:p-10"
		>
			<h3 id="empezar-solicitar" class={titulo}>{EMPEZAR.solicitar.titulo}</h3>
			<p class="mt-2 text-lg text-primary-300">{EMPEZAR.solicitar.texto}</p>

			<ul class="mt-8 mb-10 flex flex-col gap-4">
				{#each EMPEZAR.solicitar.puntos as punto (punto)}
					<li class="flex items-center gap-4">
						<span
							class="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-secondary"
							aria-hidden="true"
						>
							<CheckIcon class="size-4" />
						</span>
						{punto}
					</li>
				{/each}
			</ul>

			<LandingButton
				href={LANDING_LINKS.solicitarMe}
				external
				variant="secondary"
				tone="dark"
				size="lg"
				class="mt-auto w-full px-5 sm:w-fit sm:px-7"
			>
				<WhatsappIcon class="size-5 shrink-0" />
				{CTA_SOLICITAR}
			</LandingButton>
		</article>
	</div>
</LandingSection>
