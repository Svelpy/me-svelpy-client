<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Button, Input, Select } from '#lib/components/ui/index.ts';
	import { NOMBRE_EMPRESA_POSICION_LABEL, PREFIJOS_SUGERIDOS } from '#lib/constants/data.ts';
	import type { NombreEmpresaPosicion } from '#lib/interfaces/index.ts';
	import { tarjetaService } from '#lib/services/index.ts';
	import { currentRole } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { canCambiarSlug } from '#lib/utils/rbac.utils.ts';
	import { DOMINIO_PUBLICO } from '#lib/utils/urlPublica.ts';
	import { tarjetaEditarSchema } from '#lib/zod/tarjeta.schema.ts';
	import CampoImagen from '../campoImagen.svelte';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';
	import RubroCombobox from '../rubroCombobox.svelte';

	interface Props {
		alVolver?: () => void;
	}

	let { alVolver }: Props = $props();

	const editor = getEditor();
	const inicial = untrack(() => editor.tarjeta);

	let prefijo = $state(inicial.prefijo ?? '');
	let nombres = $state(inicial.nombres);
	let apellidos = $state(inicial.apellidos ?? '');
	let cargo = $state(inicial.cargo ?? '');
	let rubro = $state(inicial.rubro);
	let empresa = $state(inicial.nombre_empresa ?? '');
	let posicion = $state<NombreEmpresaPosicion>(inicial.nombre_empresa_posicion);
	let slug = $state(inicial.slug);
	let profileUrl = $state(inicial.profile_url);
	let coverUrl = $state(inicial.cover_url);
	let logoUrl = $state(inicial.logo_empresa_url);
	let agendaUrl = $state(inicial.photo_usuario_url);
	let slugAviso = $state('');
	const estado = new EstadoFormulario();
	const listaPrefijos = $props.id();

	const puedeCambiarSlug = $derived(canCambiarSlug($currentRole));

	const datos = $derived({
		prefijo: prefijo.trim() || null,
		nombres: nombres.trim(),
		apellidos: apellidos.trim() || null,
		cargo: cargo.trim() || null,
		rubro: rubro.trim(),
		nombre_empresa: empresa.trim() || null,
		nombre_empresa_posicion: posicion,
		profile_url: profileUrl,
		cover_url: coverUrl,
		logo_empresa_url: logoUrl,
		photo_usuario_url: agendaUrl
	});

	const cambiado = $derived(
		slug !== editor.tarjeta.slug ||
			(Object.keys(datos) as (keyof typeof datos)[]).some(
				(campo) => datos[campo] !== editor.tarjeta[campo]
			)
	);

	// El espejo muestra los cambios mientras se escriben
	$effect(() => {
		editor.previsualizar(cambiado ? datos : null, cambiado);
	});
	$effect(() => () => editor.previsualizar(null, false));

	// Disponibilidad de la dirección (solo el superadmin puede cambiarla)
	let temporizador: ReturnType<typeof setTimeout> | undefined;
	function revisarSlug() {
		clearTimeout(temporizador);
		slugAviso = '';
		if (slug === editor.tarjeta.slug) return;
		temporizador = setTimeout(async () => {
			const respuesta = await tarjetaService.slugDisponible(slug, editor.tarjeta.id);
			slugAviso = respuesta.disponible
				? 'Disponible.'
				: `${respuesta.motivo ?? 'No disponible.'}${respuesta.sugerencia ? ` Prueba con ${respuesta.sugerencia}.` : ''}`;
		}, 350);
	}

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(tarjetaEditarSchema, { ...datos, slug }, async (validos) => {
			const { slug: nuevoSlug, ...resto } = validos;
			const respuesta = await tarjetaService.actualizar(
				editor.tarjeta.id,
				puedeCambiarSlug ? { ...resto, slug: nuevoSlug } : resto
			);
			editor.guardado(respuesta);
			alert('success', 'Cambios guardados');
		});
	}
</script>

<EditorPanel
	titulo="Perfil"
	descripcion="Cómo te presentas: tu nombre, a qué te dedicas y tus imágenes."
	{alVolver}
>
	<form id="form-perfil" onsubmit={enviar} novalidate class="space-y-6">
		{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
		<div class="grid gap-5 sm:grid-cols-[8rem_1fr_1fr]">
			<Input
				label="Prefijo"
				list={listaPrefijos}
				placeholder="Dra."
				maxlength={30}
				bind:value={prefijo}
				error={estado.errores.prefijo}
			/>
			<Input
				label="Nombres"
				required
				maxlength={150}
				bind:value={nombres}
				error={estado.errores.nombres}
			/>
			<Input
				label="Apellidos"
				maxlength={150}
				bind:value={apellidos}
				error={estado.errores.apellidos}
			/>
		</div>
		<datalist id={listaPrefijos}>
			{#each PREFIJOS_SUGERIDOS as opcion (opcion)}<option value={opcion}></option>{/each}
		</datalist>
		<div class="grid gap-5 sm:grid-cols-2">
			<Input
				label="Cargo"
				placeholder="Pediatra y neonatóloga"
				maxlength={150}
				bind:value={cargo}
				error={estado.errores.cargo}
			/>
			<RubroCombobox bind:value={rubro} error={estado.errores.rubro} />
		</div>
		<div class="grid gap-5 sm:grid-cols-2">
			<Input
				label="Empresa"
				maxlength={200}
				bind:value={empresa}
				error={estado.errores.nombre_empresa}
			/>
			<Select label="Dónde se muestra la empresa" bind:value={posicion}>
				{#each Object.entries(NOMBRE_EMPRESA_POSICION_LABEL) as [valor, etiqueta] (valor)}
					<option value={valor}>{etiqueta}</option>
				{/each}
			</Select>
		</div>

		{#if puedeCambiarSlug}
			<Input
				label="Dirección de la tarjeta"
				bind:value={slug}
				oninput={revisarSlug}
				hint={slugAviso || `${DOMINIO_PUBLICO}/${slug}. Cambiarla rompe los QR ya impresos.`}
				error={estado.errores.slug}
				mono
			/>
		{:else}
			<div>
				<p class="text-sm font-medium">Dirección de la tarjeta</p>
				<p class="mt-1.5 font-mono text-[0.9375rem]">{DOMINIO_PUBLICO}/{editor.tarjeta.slug}</p>
				<p class="mt-1 text-xs text-light-two_d dark:text-dark-two_d">
					Para cambiarla, escríbenos: tus QR impresos dejarían de funcionar.
				</p>
			</div>
		{/if}

		<div
			class="grid gap-6 border-t border-light-four/40 pt-6 lg:grid-cols-2 dark:border-dark-one_d"
		>
			<CampoImagen
				id="foto-perfil"
				label="Foto de perfil"
				tipo="perfil"
				hint="Cuadrada, con tu cara al centro."
				bind:value={profileUrl}
			/>
			<CampoImagen
				id="portada"
				label="Portada"
				tipo="portada"
				hint="Horizontal. Va detrás de tu foto."
				bind:value={coverUrl}
			/>
			<CampoImagen id="logo" label="Logo de la empresa" tipo="logo" bind:value={logoUrl} />
			<CampoImagen
				id="foto-agenda"
				label="Foto para la agenda"
				tipo="agenda"
				hint="Se guarda con tu contacto. Si la dejas vacía, usamos tu foto de perfil."
				bind:value={agendaUrl}
			/>
		</div>
	</form>

	{#snippet pie()}
		{#if cambiado}<span class="mr-auto text-sm text-light-two_d dark:text-dark-two_d">
				Cambios sin guardar
			</span>{/if}
		<Button type="submit" form="form-perfil" loading={estado.enviando} disabled={!cambiado}>
			Guardar cambios
		</Button>
	{/snippet}
</EditorPanel>
