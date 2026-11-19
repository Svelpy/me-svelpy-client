<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Button, Input, Switch, TextArea } from '#lib/components/ui/index.ts';
	import { schemaDeRubro } from '#lib/config/rubros.config.ts';
	import { tarjetaSeoService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { construirJsonLd } from '#lib/utils/jsonLdTarjeta.ts';
	import { descripcionSeoTarjeta, tituloSeoTarjeta } from '#lib/utils/seoTarjeta.ts';
	import { urlPublicaTarjeta } from '#lib/utils/urlPublica.ts';
	import { tarjetaSeoSchema } from '#lib/zod/tarjetaTheme.schema.ts';
	import CampoImagen from '../campoImagen.svelte';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';
	import VistaSerp from '../vistaSerp.svelte';

	interface Props {
		alVolver?: () => void;
	}

	let { alVolver }: Props = $props();

	const editor = getEditor();
	const inicial = untrack(() => editor.tarjeta.seo);
	let metaTitle = $state(inicial.meta_title ?? '');
	let metaDescription = $state(inicial.meta_description ?? '');
	let ogImage = $state(inicial.og_image_url);
	let robotsIndex = $state(inicial.robots_index);
	const estado = new EstadoFormulario();

	const seo = $derived({
		meta_title: metaTitle.trim() || null,
		meta_description: metaDescription.trim() || null,
		og_image_url: ogImage,
		robots_index: robotsIndex
	});
	const cambiado = $derived(
		(Object.keys(seo) as (keyof typeof seo)[]).some(
			(campo) => seo[campo] !== editor.tarjeta.seo[campo]
		)
	);

	$effect(() => {
		editor.previsualizar(cambiado ? { seo: { ...editor.tarjeta.seo, ...seo } } : null, cambiado);
	});
	$effect(() => () => editor.previsualizar(null, false));

	// Lo que se genera cuando el campo queda vacío
	const generado = $derived({
		titulo: tituloSeoTarjeta({
			...editor.tarjeta,
			seo: { ...editor.tarjeta.seo, meta_title: null }
		}),
		descripcion: descripcionSeoTarjeta({
			...editor.tarjeta,
			seo: { ...editor.tarjeta.seo, meta_description: null }
		})
	});

	const url = $derived(urlPublicaTarjeta(editor.tarjeta.slug));
	const jsonLd = $derived(JSON.stringify(construirJsonLd(editor.vistaPrevia, url), null, 2));
	const geo = $derived.by(() => {
		const t = editor.tarjeta;
		const ubicacion = t.ubicaciones.find((u) => u.is_visible);
		return [
			['Tipo de negocio', schemaDeRubro(t.rubro)],
			[
				'Dirección',
				ubicacion
					? `${ubicacion.direccion}${ubicacion.ciudad ? `, ${ubicacion.ciudad}` : ''}`
					: 'Agrega una ubicación'
			],
			[
				'Coordenadas',
				ubicacion && ubicacion.lat !== null
					? 'Sí'
					: 'Faltan: pega el enlace de Google Maps en tu ubicación'
			],
			['Horarios', ubicacion?.horarios.length ? 'Sí' : 'Sin horarios'],
			['Servicios con precio', String(t.vitrina.items.filter((i) => i.is_visible).length)],
			['Preguntas frecuentes', String(t.faq.filter((f) => f.is_visible).length)]
		];
	});

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(tarjetaSeoSchema, seo, async (validos) => {
			const respuesta = await tarjetaSeoService.actualizar(editor.tarjeta.id, validos);
			editor.guardado({ seo: respuesta });
			alert('success', 'SEO guardado');
		});
	}
</script>

<EditorPanel
	titulo="SEO y GEO"
	descripcion="Cómo aparece tu tarjeta en Google y qué datos leen las inteligencias artificiales para recomendarte."
	{alVolver}
>
	<form id="form-seo" onsubmit={enviar} novalidate class="space-y-6">
		{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
		<VistaSerp
			titulo={seo.meta_title ?? generado.titulo}
			descripcion={seo.meta_description ?? generado.descripcion}
			slug={editor.tarjeta.slug}
			indexable={robotsIndex}
		/>
		<Input
			label="Título para Google"
			placeholder={generado.titulo}
			hint="Vacío = lo armamos con tu nombre, cargo y ciudad."
			maxlength={70}
			contador
			bind:value={metaTitle}
			error={estado.errores.meta_title}
		/>
		<TextArea
			label="Descripción para Google"
			placeholder={generado.descripcion}
			hint="Una o dos frases sobre lo que haces y dónde."
			rows={3}
			maxlength={160}
			contador
			bind:value={metaDescription}
			error={estado.errores.meta_description}
		/>
		<CampoImagen
			id="og-imagen"
			label="Imagen al compartir"
			tipo="og"
			hint="Aparece cuando envías tu enlace por WhatsApp o redes. Ideal 1200 × 630. Vacía = tu foto de perfil."
			bind:value={ogImage}
		/>
		<Switch
			label="Aparecer en Google"
			descripcion="Si lo apagas, tu tarjeta sigue abriendo con el enlace pero no sale en las búsquedas."
			bind:checked={robotsIndex}
		/>
	</form>

	<section
		aria-labelledby="geo-titulo"
		class="mt-10 border-t border-light-four/40 pt-8 dark:border-dark-one_d"
	>
		<h3 id="geo-titulo" class="font-display text-base font-semibold">Lo que leen las IAs</h3>
		<p class="mt-1 max-w-[60ch] text-sm text-light-two_d dark:text-dark-two_d">
			Se publica solo, con los datos de tu tarjeta. Completa lo que falta para que te recomienden en
			tu ciudad.
		</p>
		<dl
			class="mt-4 divide-y divide-light-four/40 rounded-2xl border border-light-four/40 text-sm dark:divide-dark-one_d dark:border-dark-one_d"
		>
			{#each geo as [termino, valor] (termino)}
				<div class="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:justify-between sm:gap-6">
					<dt class="text-light-two_d dark:text-dark-two_d">{termino}</dt>
					<dd class="font-medium sm:text-right">{valor}</dd>
				</div>
			{/each}
		</dl>
		<details class="mt-4">
			<summary
				class="cursor-pointer text-sm font-medium text-light-two_d hover:text-light-two dark:text-dark-two_d dark:hover:text-dark-two"
			>
				Ver los datos estructurados (JSON-LD)
			</summary>
			<pre
				class="mt-3 max-h-80 overflow-auto rounded-xl bg-light-one_d p-4 font-mono text-xs leading-relaxed dark:bg-dark-one_d">{jsonLd}</pre>
		</details>
	</section>

	{#snippet pie()}
		{#if cambiado}<span class="mr-auto text-sm text-light-two_d dark:text-dark-two_d">
				Cambios sin guardar
			</span>{/if}
		<Button type="submit" form="form-seo" loading={estado.enviando} disabled={!cambiado}>
			Guardar SEO
		</Button>
	{/snippet}
</EditorPanel>
