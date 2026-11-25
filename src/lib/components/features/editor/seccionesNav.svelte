<!--
	Índice del editor. Arriba, las partes de la tarjeta; abajo, las 8 secciones en el orden REAL en
	que aparecen (por eso van numeradas), con el ojo para mostrarlas u ocultarlas; "Cambiar orden"
	cambia el ojo por flechas para moverlas. Lo que se cambia aquí se ve al instante en el espejo.
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import type { ResolvedPathname } from '$app/types';
	import { SECCIONES_TARJETA } from '#lib/config/seccionesTarjeta.config.ts';
	import {
		ArrowDownIcon,
		ArrowUpIcon,
		ChevronRightIcon,
		EyeIcon,
		EyeOffIcon,
		PaletteIcon,
		QrcodeIcon,
		UserCircleIcon,
		WorldSearchIcon
	} from '#lib/icons/outline/index.ts';
	import type { TarjetaSeccion } from '#lib/interfaces/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { ordenar } from '#lib/utils/tarjeta.ts';
	import { getEditor, type PanelEditor } from './estadoEditor.svelte.ts';

	interface Props {
		activo: PanelEditor | null;
		/**
		 * `activo` es el panel que se muestra por defecto (no hay ?seccion=): se marca solo con espacio
		 * para las columnas, porque en el celular el índice se ve solo, sin ningún panel abierto
		 */
		predeterminado?: boolean;
		/** URL de cada panel (?seccion=…) */
		enlace: (panel: PanelEditor) => ResolvedPathname;
	}

	let { activo, predeterminado = false, enlace }: Props = $props();

	const editor = getEditor();
	const secciones = $derived(ordenar(editor.tarjeta.secciones));
	let anuncio = $state('');
	let guardando = $state(false);
	/** Con "Cambiar orden" cada sección muestra sus flechas en lugar del ojo */
	let ordenando = $state(false);

	const paneles: { id: PanelEditor; etiqueta: string; icono: Component<{ class?: string }> }[] = [
		{ id: 'perfil', etiqueta: 'Perfil', icono: UserCircleIcon },
		{ id: 'apariencia', etiqueta: 'Apariencia', icono: PaletteIcon },
		{ id: 'compartir', etiqueta: 'Compartir', icono: QrcodeIcon },
		{ id: 'seo', etiqueta: 'SEO y GEO', icono: WorldSearchIcon }
	];

	/** Cambio optimista: se ve al instante y el editor lo deshace si el servidor lo rechaza */
	async function guardar(nuevas: TarjetaSeccion[], mensaje: string) {
		guardando = true;
		try {
			await editor.guardarSecciones(nuevas);
			anuncio = mensaje;
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			guardando = false;
		}
	}

	function alternar(seccion: TarjetaSeccion) {
		const etiqueta = SECCIONES_TARJETA[seccion.clave].etiqueta;
		guardar(
			secciones.map((s) => (s.id === seccion.id ? { ...s, is_visible: !s.is_visible } : s)),
			`${etiqueta} ${seccion.is_visible ? 'ya no se muestra' : 'vuelve a mostrarse'} en la tarjeta.`
		);
	}

	function mover(indice: number, paso: -1 | 1) {
		const destino = indice + paso;
		if (destino < 0 || destino >= secciones.length) return;
		const lista = [...secciones];
		[lista[indice], lista[destino]] = [lista[destino], lista[indice]];
		const etiqueta = SECCIONES_TARJETA[secciones[indice].clave].etiqueta;
		guardar(
			lista.map((s, orden) => ({ ...s, orden })),
			`${etiqueta} quedó en el lugar ${destino + 1}.`
		);
	}

	const claseEnlace =
		'flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-light-three dark:focus-visible:outline-dark-three';
	const claseActivo = $derived(
		predeterminado
			? 'text-light-two_d @3xl:bg-light-one_d @3xl:text-light-two dark:text-dark-two_d dark:@3xl:bg-dark-one_d dark:@3xl:text-dark-two'
			: 'bg-light-one_d text-light-two dark:bg-dark-one_d dark:text-dark-two'
	);
	const claseInactivo =
		'text-light-two_d hover:bg-light-one_d/60 hover:text-light-two dark:text-dark-two_d dark:hover:bg-dark-one_d/60 dark:hover:text-dark-two';
	const claseMini =
		'grid size-8 shrink-0 place-items-center rounded-lg text-light-two_d transition-[opacity,color,background-color] hover:bg-light-one_d hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three disabled:pointer-events-none disabled:opacity-30 dark:text-dark-two_d dark:hover:bg-dark-one_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three';
</script>

{#snippet marcaActiva(esActivo: boolean)}
	{#if esActivo}
		<span
			class="absolute inset-y-2 -left-px w-0.75 rounded-r-full bg-light-accent dark:bg-dark-accent {predeterminado
				? 'hidden @3xl:block'
				: ''}"
			aria-hidden="true"
		></span>
	{/if}
{/snippet}

<nav aria-label="Partes de la tarjeta" class="space-y-7">
	<div>
		<p class="px-3 text-xs font-medium text-light-four_d dark:text-dark-four_d">Tu tarjeta</p>
		<ul class="mt-2 space-y-0.5">
			{#each paneles as panel (panel.id)}
				{@const esActivo = activo === panel.id}
				<li class="relative">
					{@render marcaActiva(esActivo)}
					<a
						href={enlace(panel.id)}
						aria-current={esActivo && !predeterminado ? 'page' : undefined}
						class="{claseEnlace} {esActivo ? claseActivo : claseInactivo}"
					>
						<panel.icono class="size-4.5 shrink-0" />
						<span class="truncate">{panel.etiqueta}</span>
						<ChevronRightIcon class="ml-auto size-4 shrink-0 opacity-50 @3xl:hidden" />
					</a>
				</li>
			{/each}
		</ul>
	</div>

	<div>
		<div class="flex items-center justify-between gap-2 px-3">
			<!-- Los números ya dicen que es una secuencia: el título no lo repite -->
			<p id="secciones-titulo" class="text-xs font-medium text-light-four_d dark:text-dark-four_d">
				Secciones
			</p>
			<button
				type="button"
				aria-pressed={ordenando}
				onclick={() => (ordenando = !ordenando)}
				class="-mr-1.5 rounded-md px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap text-light-two_d underline-offset-4 transition-colors hover:text-light-two hover:underline focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three"
			>
				{ordenando ? 'Listo' : 'Cambiar orden'}
			</button>
		</div>
		<ol aria-labelledby="secciones-titulo" class="mt-2 space-y-0.5">
			{#each secciones as seccion, indice (seccion.id)}
				{@const config = SECCIONES_TARJETA[seccion.clave]}
				{@const esActivo = activo === seccion.clave}
				<li class="relative flex items-center gap-0.5">
					{@render marcaActiva(esActivo)}
					<a
						href={enlace(seccion.clave)}
						aria-current={esActivo && !predeterminado ? 'page' : undefined}
						class="{claseEnlace} {esActivo ? claseActivo : claseInactivo} {seccion.is_visible
							? ''
							: 'opacity-55'}"
					>
						<span
							class="w-4 shrink-0 text-right text-xs text-light-four_d tabular-nums dark:text-dark-four_d"
							aria-hidden="true"
						>
							{indice + 1}
						</span>
						<config.icono class="size-4.5 shrink-0" />
						<span class="min-w-0 leading-snug text-pretty">{config.etiqueta}</span>
						{#if !seccion.is_visible}<span class="sr-only">(oculta)</span>{/if}
					</a>
					{#if ordenando}
						<button
							type="button"
							class={claseMini}
							aria-label="Subir {config.etiqueta}"
							disabled={indice === 0 || guardando}
							onclick={() => mover(indice, -1)}
						>
							<ArrowUpIcon class="size-4" />
						</button>
						<button
							type="button"
							class={claseMini}
							aria-label="Bajar {config.etiqueta}"
							disabled={indice === secciones.length - 1 || guardando}
							onclick={() => mover(indice, 1)}
						>
							<ArrowDownIcon class="size-4" />
						</button>
					{:else}
						<button
							type="button"
							class={claseMini}
							aria-label="{seccion.is_visible
								? 'Ocultar'
								: 'Mostrar'} {config.etiqueta} en la tarjeta"
							disabled={guardando}
							onclick={() => alternar(seccion)}
						>
							{#if seccion.is_visible}<EyeIcon class="size-4" />{:else}<EyeOffIcon
									class="size-4"
								/>{/if}
						</button>
					{/if}
				</li>
			{/each}
		</ol>
	</div>
	<p class="sr-only" aria-live="polite">{anuncio}</p>
</nav>
