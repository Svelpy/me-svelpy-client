<!--
	La otra forma de tener un ME, sobre fondo oscuro: que el equipo la arme (WhatsApp). Va debajo de
	la cápsula de registro, con menos peso pero el mismo nombre de acción en toda la landing.
-->
<script lang="ts">
	import { WhatsappIcon } from '#lib/icons/outline/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { CTA_SOLICITAR, HERO, LANDING_LINKS } from '../landing.content.ts';

	let { class: className = '' }: { class?: string } = $props();
</script>

<div class={cn('flex max-w-xl flex-wrap items-center gap-x-4 gap-y-3', className)}>
	<p class="text-primary-300">{HERO.alternativa}</p>
	<!-- eslint-disable svelte/no-navigation-without-resolve -- WhatsApp: sitio externo -->
	<a
		href={LANDING_LINKS.solicitarMe}
		target="_blank"
		rel="noopener noreferrer"
		class="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 pr-5 pl-4 font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-primary-950 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
	>
		<WhatsappIcon class="size-5 shrink-0" />
		{CTA_SOLICITAR}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</div>
