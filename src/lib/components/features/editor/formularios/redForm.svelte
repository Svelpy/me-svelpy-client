<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Input, Select } from '#lib/components/ui/index.ts';
	import { LinkIcon } from '#lib/icons/outline/index.ts';
	import { RED_SOCIAL_LABEL, REDES_SOCIALES } from '#lib/constants/data.ts';
	import type { RedSocial, TarjetaSocial, TarjetaSocialInput } from '#lib/interfaces/index.ts';
	import { detectarRedSocial, usuarioDesdeUrl, websiteUrl } from '#lib/utils/contacto.ts';
	import { tarjetaSocialSchema } from '#lib/zod/tarjetaSocial.schema.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';

	interface Props {
		id: string;
		inicial: TarjetaSocial | null;
		guardar: (datos: TarjetaSocialInput) => Promise<void>;
	}

	let { id, inicial, guardar }: Props = $props();

	const base = untrack(() => inicial);
	let url = $state(base?.url ?? '');
	let red = $state<RedSocial>(base?.red ?? 'instagram');
	let username = $state(base?.username ?? '');
	const estado = new EstadoFormulario();

	/** Al pegar el enlace se reconoce la red y el usuario */
	function alCambiarUrl() {
		const detectada = detectarRedSocial(url);
		if (detectada) red = detectada;
		if (!username) username = usuarioDesdeUrl(url) ?? '';
	}

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		const enlace = url.trim() ? websiteUrl(url.trim()) : '';
		estado.enviar(tarjetaSocialSchema, { red, url: enlace, username }, guardar);
	}
</script>

<form {id} onsubmit={enviar} novalidate class="space-y-5">
	{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
	<Input
		label="Enlace"
		type="url"
		icon={LinkIcon}
		placeholder="https://instagram.com/tu.usuario"
		hint="Pégalo y reconocemos la red."
		required
		bind:value={url}
		onchange={alCambiarUrl}
		onpaste={() => setTimeout(alCambiarUrl)}
		error={estado.errores.url}
	/>
	<div class="grid gap-5 sm:grid-cols-2">
		<Select label="Red" bind:value={red} error={estado.errores.red}>
			{#each REDES_SOCIALES as opcion (opcion)}
				<option value={opcion}>{RED_SOCIAL_LABEL[opcion]}</option>
			{/each}
		</Select>
		<Input
			label="Usuario"
			placeholder="tu.usuario"
			maxlength={100}
			bind:value={username}
			error={estado.errores.username}
		/>
	</div>
</form>
