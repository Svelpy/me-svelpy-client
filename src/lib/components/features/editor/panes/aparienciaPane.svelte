<script lang="ts">
	import { untrack } from 'svelte';
	import TarjetaFuentes from '../../tarjeta/tarjetaFuentes.svelte';
	import {
		AlertBox,
		Button,
		ColorField,
		RangeField,
		SegmentedControl
	} from '#lib/components/ui/index.ts';
	import { TEMA_PRESETS, TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
	import { familiaCss, TIPOGRAFIAS_TARJETA } from '#lib/config/tipografiasTarjeta.config.ts';
	import { FAB_POSICION_LABEL, ICONO_FORMA_LABEL } from '#lib/constants/data.ts';
	import type {
		TarjetaThemeColores,
		TarjetaThemeUpdateRequest,
		TemaPreset
	} from '#lib/interfaces/index.ts';
	import { tarjetaThemeService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import type { CampoColor } from '#lib/utils/color.ts';
	import { tarjetaThemeSchema } from '#lib/zod/tarjetaTheme.schema.ts';
	import AvisoContraste from '../avisoContraste.svelte';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';

	interface Props {
		alVolver?: () => void;
	}

	let { alVolver }: Props = $props();

	const editor = getEditor();

	function desdeTarjeta(): TarjetaThemeUpdateRequest {
		const {
			id: _id,
			tarjeta_id: _t,
			created_at: _c,
			updated_at: _u,
			...tema
		} = editor.tarjeta.theme;
		return tema;
	}

	let tema = $state<TarjetaThemeUpdateRequest>(untrack(desdeTarjeta));
	const estado = new EstadoFormulario();

	const cambiado = $derived(JSON.stringify(tema) !== JSON.stringify(desdeTarjeta()));

	$effect(() => {
		editor.previsualizar(
			cambiado ? { theme: { ...editor.tarjeta.theme, ...tema } } : null,
			cambiado
		);
	});
	$effect(() => () => editor.previsualizar(null, false));

	/** Un preset reemplaza los colores; la tipografía elegida se conserva */
	function aplicarPreset(preset: TemaPreset) {
		tema = { ...TEMAS_TARJETA[preset].colores, preset, tipografia: tema.tipografia };
	}

	const grupos: { titulo: string; campos: [CampoColor, string][] }[] = [
		{
			titulo: 'Fondo',
			campos: [
				['color_fondo', 'Fondo general'],
				['color_superficie', 'Secciones y tarjetas'],
				['color_borde', 'Bordes y separadores']
			]
		},
		{
			titulo: 'Textos',
			campos: [
				['color_titulo', 'Títulos y nombre'],
				['color_texto', 'Texto principal'],
				['color_texto_secundario', 'Cargo, fechas y etiquetas']
			]
		},
		{
			titulo: 'Botones',
			campos: [
				['color_primario', 'Botón principal y enlaces'],
				['color_texto_sobre_primario', 'Texto del botón principal'],
				['color_secundario', 'Botones secundarios y filtros'],
				['color_texto_sobre_secundario', 'Texto de los secundarios']
			]
		},
		{
			titulo: 'Vitrina',
			campos: [
				['color_precio', 'Precios'],
				['color_destacado', 'Insignia «Destacado»'],
				['color_texto_sobre_destacado', 'Texto de la insignia']
			]
		},
		{
			titulo: 'Íconos',
			campos: [
				['color_icono', 'Íconos de contacto'],
				['color_fondo_icono', 'Fondo de los íconos'],
				['color_icono_social', 'Íconos de redes'],
				['color_fondo_icono_social', 'Fondo de los de redes']
			]
		},
		{
			titulo: 'Botón flotante',
			campos: [
				['color_fab_fondo', 'Fondo del botón'],
				['color_fab_icono', 'Ícono del botón']
			]
		}
	];

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(tarjetaThemeSchema, tema, async (validos) => {
			const respuesta = await tarjetaThemeService.actualizar(editor.tarjeta.id, validos);
			editor.guardado({ theme: respuesta });
			tema = desdeTarjeta();
			alert('success', 'Apariencia guardada');
		});
	}

	const colores = $derived<TarjetaThemeColores>(tema);
</script>

<TarjetaFuentes tipografias={TIPOGRAFIAS_TARJETA} precargar={false} />

<EditorPanel
	titulo="Apariencia"
	descripcion="Empieza con un tema y ajusta cada color hasta que sea tuyo."
	{alVolver}
>
	<form id="form-apariencia" onsubmit={enviar} novalidate class="space-y-10">
		{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}

		<fieldset>
			<legend class="font-display text-base font-semibold">Tema de partida</legend>
			<div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-5">
				{#each TEMA_PRESETS as preset (preset)}
					{@const c = TEMAS_TARJETA[preset].colores}
					<label class="group relative cursor-pointer">
						<input
							type="radio"
							name="preset"
							value={preset}
							checked={tema.preset === preset}
							onchange={() => aplicarPreset(preset)}
							class="peer sr-only"
						/>
						<span
							class="flex flex-col overflow-hidden rounded-2xl border-2 border-light-four/40 transition-colors peer-checked:border-light-three peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-light-three dark:border-dark-one_d dark:peer-checked:border-dark-three"
						>
							<span class="flex h-12 items-end gap-1 px-2.5 pb-2" style:background={c.color_fondo}>
								<span class="h-5 w-8 rounded-full" style:background={c.color_primario}></span>
								<span class="h-5 w-5 rounded-full" style:background={c.color_secundario}></span>
								<span class="h-5 w-3 rounded-full" style:background={c.color_destacado}></span>
							</span>
							<span class="px-2.5 py-2 text-sm font-semibold">{TEMAS_TARJETA[preset].nombre}</span>
						</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<fieldset>
			<legend class="font-display text-base font-semibold">Tipografía</legend>
			<div class="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
				{#each TIPOGRAFIAS_TARJETA as opcion (opcion.id)}
					<label class="relative cursor-pointer">
						<input
							type="radio"
							name="tipografia"
							value={opcion.id}
							bind:group={tema.tipografia}
							class="peer sr-only"
						/>
						<span
							class="block h-full rounded-2xl border-2 border-light-four/40 px-3.5 py-3 transition-colors peer-checked:border-light-three peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-light-three dark:border-dark-one_d dark:peer-checked:border-dark-three"
						>
							<span
								class="block text-xl leading-tight"
								style:font-family={familiaCss(opcion.titulos)}
								style:font-weight={opcion.pesoTitulos}
							>
								{editor.tarjeta.nombres}
							</span>
							<span class="mt-1 block text-sm" style:font-family={familiaCss(opcion.texto)}>
								{opcion.nombre}. {opcion.descripcion}
							</span>
						</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<div class="space-y-8">
			{#each grupos as grupo (grupo.titulo)}
				<fieldset>
					<legend class="font-display text-base font-semibold">{grupo.titulo}</legend>
					<div class="mt-3 grid gap-x-8 gap-y-4 xl:grid-cols-2">
						{#each grupo.campos as [campo, etiqueta] (campo)}
							<ColorField label={etiqueta} bind:value={tema[campo]} error={estado.errores[campo]} />
						{/each}
					</div>
					{#if grupo.titulo === 'Íconos'}
						<SegmentedControl
							label="Forma de los íconos"
							bind:value={tema.icono_forma}
							options={Object.entries(ICONO_FORMA_LABEL).map(([value, label]) => ({
								value: value as typeof tema.icono_forma,
								label
							}))}
							class="mt-5"
						/>
					{/if}
					{#if grupo.titulo === 'Botón flotante'}
						<SegmentedControl
							label="Lado de la pantalla"
							bind:value={tema.fab_posicion}
							options={Object.entries(FAB_POSICION_LABEL).map(([value, label]) => ({
								value: value as typeof tema.fab_posicion,
								label
							}))}
							class="mt-5"
						/>
					{/if}
				</fieldset>
			{/each}

			<fieldset>
				<legend class="font-display text-base font-semibold">Portada</legend>
				<div class="mt-3 grid gap-x-8 gap-y-4 xl:grid-cols-2">
					<ColorField
						label="Velo sobre la foto de portada"
						bind:value={tema.color_overlay_portada}
					/>
					<RangeField
						label="Intensidad del velo"
						sufijo="%"
						bind:value={tema.overlay_opacidad}
						hint="Más velo = textos más legibles sobre la foto."
					/>
				</div>
			</fieldset>
		</div>

		<section aria-label="Legibilidad">
			<h3 class="font-display text-base font-semibold">Legibilidad</h3>
			<div class="mt-3"><AvisoContraste {colores} /></div>
		</section>
	</form>

	{#snippet pie()}
		{#if cambiado}
			<Button variant="ghost" class="mr-auto" onclick={() => (tema = desdeTarjeta())}>
				Descartar cambios
			</Button>
		{/if}
		<Button type="submit" form="form-apariencia" loading={estado.enviando} disabled={!cambiado}>
			Guardar apariencia
		</Button>
	{/snippet}
</EditorPanel>
