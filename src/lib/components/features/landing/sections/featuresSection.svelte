<script lang="ts">
	import qrMe from '#lib/assets/landing/qr-me-svelpy.svg';
	import { DownloadIcon, MapPinIcon, WhatsappIcon } from '#lib/icons/outline/index.ts';
	import PaletteDemo from '../demos/paletteDemo.svelte';
	import { LandingSection, SectionHeader } from '../ui/index.ts';
	import { COLORES_DEMO, FUNCIONES, ME_DOMINIO } from '../landing.content.ts';

	const celda = 'flex flex-col rounded-[1.75rem] border border-primary-200 bg-white p-6 sm:p-7';
	const tituloCelda = 'font-display text-xl font-bold tracking-[-0.01em] text-primary-900';
	const textoCelda = 'mt-2 mb-6 text-[15px] leading-relaxed text-primary-600';

	const sucursales = [
		{ nombre: 'Consultorio Centro', direccion: 'Calle 7 Oeste 23, piso 2' },
		{ nombre: 'Consultorio Norte', direccion: 'Av. del Norte 1820, local 8' }
	];

	const horarios = [
		{ dia: 'Lunes a viernes', horas: '09:00 – 19:00' },
		{ dia: 'Sábado', horas: '09:00 – 13:00' },
		{ dia: 'Domingo', horas: 'Cerrado' }
	];
</script>

<LandingSection id="beneficios" labelledby="beneficios-titulo" tone="mist">
	<SectionHeader id="beneficios-titulo" title={FUNCIONES.titulo} subtitle={FUNCIONES.subtitulo} />

	<div class="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
		<!-- Paleta: interactiva -->
		<article class="{celda} md:row-span-2 lg:col-span-3">
			<h3 class={tituloCelda}>{FUNCIONES.paleta.titulo}</h3>
			<p class={textoCelda}>{FUNCIONES.paleta.texto}</p>
			<PaletteDemo colores={COLORES_DEMO} class="mt-auto" />
		</article>

		<!-- Catálogo -->
		<article class="{celda} lg:col-span-3">
			<h3 class={tituloCelda}>{FUNCIONES.catalogo.titulo}</h3>
			<p class={textoCelda}>{FUNCIONES.catalogo.texto}</p>
			<div class="mt-auto flex items-center gap-4 rounded-2xl bg-primary-50 p-3" aria-hidden="true">
				<svg viewBox="0 0 120 120" class="size-16 shrink-0 rounded-xl">
					<rect width="120" height="120" fill="#DBEAFE" />
					<rect y="92" width="120" height="28" fill="#BBF7D0" />
					<polygon points="18,58 52,30 86,58" fill="#1E3A8A" />
					<rect x="24" y="56" width="56" height="38" fill="#fff" />
					<rect x="46" y="70" width="12" height="24" fill="#1E3A8A" />
					<circle cx="100" cy="76" r="14" fill="#16A34A" />
				</svg>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-semibold text-primary-900">Casa en condominio cerrado</p>
					<p class="text-xs text-primary-600">3 dorm., 220 m²</p>
					<p class="mt-1 font-display font-bold text-primary-900">USD 185.000</p>
				</div>
				<span
					class="hidden items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-bold text-[#166534] sm:inline-flex"
				>
					<WhatsappIcon class="size-3.5" />
					Consultar
				</span>
			</div>
		</article>

		<!-- Sucursales -->
		<article class="{celda} lg:col-span-3">
			<h3 class={tituloCelda}>{FUNCIONES.sucursales.titulo}</h3>
			<p class={textoCelda}>{FUNCIONES.sucursales.texto}</p>
			<ul class="mt-auto space-y-2" aria-hidden="true">
				{#each sucursales as sucursal (sucursal.nombre)}
					<li class="flex items-center gap-3 rounded-2xl bg-primary-50 p-3">
						<span
							class="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-primary-950"
						>
							<MapPinIcon class="size-4" />
						</span>
						<span class="min-w-0">
							<span class="block text-sm font-semibold text-primary-900">{sucursal.nombre}</span>
							<span class="block truncate text-xs text-primary-600">{sucursal.direccion}</span>
						</span>
						<span class="ml-auto shrink-0 text-xs font-semibold text-primary-700 underline">
							Ver mapa
						</span>
					</li>
				{/each}
			</ul>
		</article>

		<!-- Horarios -->
		<article class="{celda} lg:col-span-2">
			<h3 class={tituloCelda}>{FUNCIONES.horarios.titulo}</h3>
			<p class={textoCelda}>{FUNCIONES.horarios.texto}</p>
			<div class="mt-auto rounded-2xl bg-primary-50 p-4" aria-hidden="true">
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-bold text-[#166534]"
				>
					<span class="size-1.5 rounded-full bg-[#16a34a]"></span>
					Abierto ahora
				</span>
				<dl class="mt-3 space-y-1.5 text-sm">
					{#each horarios as h (h.dia)}
						<div class="flex justify-between gap-3">
							<dt class="text-primary-600">{h.dia}</dt>
							<dd class="font-semibold text-primary-900 tabular-nums">{h.horas}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</article>

		<!-- .vcf -->
		<article class="{celda} lg:col-span-2">
			<h3 class={tituloCelda}>{FUNCIONES.vcf.titulo}</h3>
			<p class={textoCelda}>{FUNCIONES.vcf.texto}</p>
			<div
				class="mt-auto flex items-center gap-3 rounded-2xl bg-primary-900 p-3 text-white"
				aria-hidden="true"
			>
				<span
					class="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary-950"
				>
					<DownloadIcon class="size-5" />
				</span>
				<span class="min-w-0">
					<span class="block truncate font-mono text-sm">valeria-rojas.vcf</span>
					<span class="block text-xs leading-snug text-primary-300">
						Foto, nombre, cargo, teléfono, correo y dirección
					</span>
				</span>
			</div>
		</article>

		<!-- QR + enlace -->
		<article class="{celda} md:col-span-2 lg:col-span-2">
			<h3 class={tituloCelda}>{FUNCIONES.qr.titulo}</h3>
			<p class={textoCelda}>{FUNCIONES.qr.texto}</p>
			<div class="mt-auto flex items-center gap-4">
				<span
					class="grid size-24 shrink-0 place-items-center rounded-2xl border border-primary-200 p-2.5"
				>
					<img
						src={qrMe}
						alt={`Código QR que abre ${ME_DOMINIO}`}
						class="size-full"
						width="76"
						height="76"
					/>
				</span>
				<p class="min-w-0 font-mono text-sm text-primary-600">
					{ME_DOMINIO}/<wbr /><span class="text-primary-900">tu-nombre</span>
				</p>
			</div>
		</article>
	</div>
</LandingSection>
