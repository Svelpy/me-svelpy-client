<!--
	Las funciones se apilan como los botones de un perfil ME: una cápsula por cosa que tu cliente
	encuentra en tu enlace.
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import {
		AddressBookIcon,
		CalendarIcon,
		CertificateIcon,
		HelpCircleIcon,
		MapPinIcon,
		QrcodeIcon,
		TagIcon,
		WalletIcon
	} from '#lib/icons/outline/index.ts';
	import { LandingButton, LandingSection, SectionHeader } from '../ui/index.ts';
	import { CTA_CREAR, FUNCIONES, LANDING_LINKS, type IconoFuncion } from '../landing.content.ts';

	const iconos: Record<IconoFuncion, Component<{ class?: string }>> = {
		contacto: AddressBookIcon,
		vitrina: TagIcon,
		sucursales: MapPinIcon,
		pago: WalletIcon,
		redes: CalendarIcon,
		formacion: CertificateIcon,
		preguntas: HelpCircleIcon,
		qr: QrcodeIcon
	};
</script>

<LandingSection id="funciones" labelledby="funciones-titulo">
	<div class="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
		<div class="lg:sticky lg:top-28 lg:self-start">
			<SectionHeader
				id="funciones-titulo"
				title={FUNCIONES.titulo}
				subtitle={FUNCIONES.subtitulo}
			/>
			<LandingButton href={LANDING_LINKS.registro} size="lg" class="mt-9">
				{CTA_CREAR}
			</LandingButton>
		</div>

		<ul class="flex flex-col gap-3">
			{#each FUNCIONES.items as item (item.titulo)}
				{@const Icono = iconos[item.icono]}
				<li
					class="flex items-center gap-4 rounded-[2rem] border border-primary-200 bg-white py-3 pr-6 pl-3 sm:rounded-full"
				>
					<span
						class="grid size-12 shrink-0 place-items-center rounded-full bg-primary-900 text-white"
						aria-hidden="true"
					>
						<Icono class="size-5" />
					</span>
					<span class="min-w-0">
						<span class="block font-display text-lg leading-tight font-bold text-primary-900">
							{item.titulo}
						</span>
						<span class="mt-0.5 block text-[15px] leading-snug text-primary-600">{item.texto}</span>
					</span>
				</li>
			{/each}
		</ul>
	</div>
</LandingSection>
