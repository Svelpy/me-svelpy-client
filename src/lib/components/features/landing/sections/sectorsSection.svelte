<script lang="ts">
	import {
		CapsuleMarker,
		CapsuleTabs,
		LandingButton,
		LandingSection,
		PhoneFrame,
		SectionHeader
	} from '../ui/index.ts';
	import { WhatsappIcon } from '#lib/icons/outline/index.ts';
	import { CTA_SOLICITAR, LANDING_LINKS, SECTORES } from '../landing.content.ts';

	const items = SECTORES.items.map((sector) => ({ ...sector, label: sector.tab }));
	const crearExterno = LANDING_LINKS.crearMe.startsWith('http');
</script>

<LandingSection id="sectores" labelledby="sectores-titulo">
	<SectionHeader id="sectores-titulo" title={SECTORES.titulo} />

	<CapsuleTabs {items} label="Profesiones" idPrefix="sector" class="mt-10">
		{#snippet panel(sector)}
			<div
				class="mt-12 grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20"
			>
				<div class="max-w-xl">
					<h3
						class="font-display text-[1.75rem] leading-[1.08] font-bold tracking-[-0.03em] text-balance sm:text-4xl"
					>
						{sector.titular}
					</h3>
					<p class="mt-5 text-lg leading-relaxed text-pretty text-primary-600">
						{sector.descripcion}
					</p>
					<ul class="mt-8 space-y-3">
						{#each sector.destaca as punto (punto)}
							<li class="flex gap-3 leading-relaxed text-primary-700">
								<CapsuleMarker />
								<span>{punto}</span>
							</li>
						{/each}
					</ul>
					<LandingButton
						href={LANDING_LINKS.crearMe}
						external={crearExterno}
						variant="secondary"
						class="mt-10"
					>
						<WhatsappIcon class="size-5" />
						{CTA_SOLICITAR}
					</LandingButton>
				</div>

				<div class="flex flex-col items-center gap-4">
					<PhoneFrame
						slug={sector.perfil.slug}
						scrollable
						screenLabel={`Perfil de ejemplo de ${sector.perfil.nombre}`}
						class="w-[284px]"
					>
						{#key sector.perfil.slug}
							<enhanced:img
								src={sector.perfil.imagen}
								alt={sector.perfil.alt}
								sizes="300px"
								loading="lazy"
								class="h-auto w-full"
							/>
						{/key}
					</PhoneFrame>
					<p class="text-sm text-primary-600">
						Desliza dentro del teléfono para ver el perfil completo.
					</p>
				</div>
			</div>
		{/snippet}
	</CapsuleTabs>
</LandingSection>
