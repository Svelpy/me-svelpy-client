<!--
	Demo interactiva de los temas predefinidos (`tarjeta_theme.preset`): al elegir un tema, una mini
	tarjeta aplica todos sus colores (portada, íconos, botones, vitrina y botón flotante).
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { MailIcon, MapPinIcon, PhoneIcon, WhatsappIcon } from '#lib/icons/outline/index.ts';
	import type { TemaTarjeta } from '#lib/config/temasTarjeta.config.ts';
	import type { IconoForma, TemaPreset } from '#lib/interfaces/tarjetaTheme.interface.ts';
	import { cn } from '#lib/utils/cn.ts';

	interface Props {
		temas: Record<TemaPreset, TemaTarjeta>;
		/** Texto bajo el selector. */
		nota?: string;
		class?: string;
	}

	let { temas, nota, class: className = '' }: Props = $props();

	const presets = $derived(Object.keys(temas) as TemaPreset[]);
	let seleccion = $state<TemaPreset>(untrack(() => Object.keys(temas)[0] as TemaPreset));
	const tema = $derived(temas[seleccion]);
	const c = $derived(tema.colores);

	const formas: Record<IconoForma, string> = {
		circulo: 'rounded-full',
		redondeado: 'rounded-lg',
		cuadrado: 'rounded-none',
		ninguno: 'rounded-full bg-transparent!'
	};

	/** Opacidad 0-100 → canal alfa hex para el overlay de la portada. */
	const alfa = (opacidad: number) =>
		Math.round((opacidad / 100) * 255)
			.toString(16)
			.padStart(2, '0');
</script>

<div class={cn('flex flex-col gap-5', className)}>
	<!-- Vista previa: aplica todos los colores del tema -->
	<div
		class="relative overflow-hidden rounded-3xl border transition-colors duration-300 motion-reduce:transition-none"
		style:background={c.color_fondo}
		style:border-color={c.color_borde}
		data-testid="palette-preview"
		data-preset={seleccion}
		aria-hidden="true"
	>
		<div
			class="relative h-20"
			style:background-color={c.color_primario}
			style="background-image: repeating-linear-gradient(-35deg, transparent 0 18px, rgb(255 255 255 / 0.12) 18px 36px)"
		>
			<span
				class="absolute inset-0"
				style:background={`${c.color_overlay_portada}${alfa(c.overlay_opacidad)}`}
			></span>
		</div>

		<div class="-mt-9 flex flex-col items-center px-4 pb-16">
			<span
				class="relative grid size-[72px] place-items-center rounded-full border-4 font-display text-xl font-bold"
				style:background={c.color_secundario}
				style:color={c.color_texto_sobre_secundario}
				style:border-color={c.color_fondo}
			>
				TN
			</span>
			<p class="mt-2 font-display text-lg font-bold" style:color={c.color_titulo}>Tu nombre</p>
			<p class="text-xs" style:color={c.color_texto_secundario}>Tu especialidad, tu empresa</p>

			<div class="mt-3 flex gap-2.5">
				{#each [PhoneIcon, WhatsappIcon, MailIcon, MapPinIcon] as Icono, i (i)}
					<span
						class={cn('grid size-9 place-items-center', formas[c.icono_forma])}
						style:background={c.color_fondo_icono}
						style:color={c.color_icono}
					>
						<Icono class="size-4" />
					</span>
				{/each}
			</div>

			<span
				class="mt-4 flex h-10 w-full items-center justify-center rounded-full text-sm font-semibold"
				style:background={c.color_primario}
				style:color={c.color_texto_sobre_primario}
			>
				Guardar contacto
			</span>

			<div
				class="mt-3 flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left"
				style:background={c.color_superficie}
				style:border-color={c.color_borde}
			>
				<span class="size-12 shrink-0 rounded-xl" style:background={c.color_secundario}></span>
				<span class="min-w-0 flex-1">
					<span class="flex items-center gap-1.5">
						<span class="truncate text-sm font-semibold" style:color={c.color_titulo}>
							Tu servicio estrella
						</span>
						<span
							class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
							style:background={c.color_destacado}
							style:color={c.color_texto_sobre_destacado}
						>
							Destacado
						</span>
					</span>
					<span class="mt-0.5 flex items-baseline gap-1.5 text-sm">
						<span class="font-display font-bold" style:color={c.color_precio}>Bs 850</span>
						<span class="text-xs line-through" style:color={c.color_texto_secundario}>
							Bs 1.000
						</span>
					</span>
				</span>
			</div>
		</div>

		<span
			class={cn(
				'absolute bottom-3 grid size-10 place-items-center rounded-full',
				c.fab_posicion === 'izquierda' ? 'left-3' : 'right-3'
			)}
			style:background={c.color_fab_fondo}
			style:color={c.color_fab_icono}
		>
			<WhatsappIcon class="size-5" />
		</span>
	</div>

	<!-- Selector de tema -->
	<fieldset class="min-w-0">
		<legend class="mb-3 text-sm font-semibold text-primary-900">
			Tema inicial: <span class="font-normal text-primary-600">{tema.nombre}</span>
		</legend>
		<div class="flex flex-wrap gap-2">
			{#each presets as preset (preset)}
				{@const t = temas[preset].colores}
				<label class="relative cursor-pointer">
					<input
						type="radio"
						name="tema-tarjeta"
						value={preset}
						bind:group={seleccion}
						class="peer sr-only"
					/>
					<span
						class="flex h-10 items-center gap-2 rounded-full border border-primary-200 bg-white pr-3.5 pl-1.5 text-sm font-semibold text-primary-700 transition-colors peer-checked:border-primary-900 peer-checked:bg-primary-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary"
					>
						<span
							class="flex h-7 w-7 overflow-hidden rounded-full ring-1 ring-black/10"
							aria-hidden="true"
						>
							<span class="h-full w-1/3" style:background={t.color_fondo}></span>
							<span class="h-full w-1/3" style:background={t.color_primario}></span>
							<span class="h-full w-1/3" style:background={t.color_destacado}></span>
						</span>
						{temas[preset].nombre}
					</span>
				</label>
			{/each}
		</div>
		{#if nota}
			<p class="mt-3 text-sm text-primary-600">{nota}</p>
		{/if}
	</fieldset>
</div>
