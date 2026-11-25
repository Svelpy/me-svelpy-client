<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import EnlacePublico from '../../panel/enlacePublico.svelte';
	import AvisoPublicacion from '../../planes/avisoPublicacion.svelte';
	import { AlertBox, Button, QrCode } from '#lib/components/ui/index.ts';
	import {
		AddressBookIcon,
		DownloadIcon,
		ExternalLinkIcon,
		WhatsappIcon
	} from '#lib/icons/outline/index.ts';
	import { downloadBlob } from '#lib/utils/download.ts';
	import { nombreCompleto } from '#lib/utils/tarjeta.ts';
	import { urlPublicaTarjeta, urlQrTarjeta } from '#lib/utils/urlPublica.ts';
	import {
		fotoDeContacto,
		fotoParaVCard,
		generarVCard,
		nombreArchivoVcf
	} from '#lib/utils/vcard.ts';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';

	interface Props {
		alVolver?: () => void;
		/** El botón de publicar del editor */
		publicar: Snippet<['sm' | 'md']>;
	}

	let { alVolver, publicar }: Props = $props();

	const editor = getEditor();
	const tarjeta = $derived(editor.tarjeta);
	const url = $derived(urlPublicaTarjeta(tarjeta.slug));
	// El QR abre /t/{id}: sigue funcionando impreso aunque cambie el enlace
	const urlQr = $derived(urlQrTarjeta(tarjeta.id));
	let qr = $state<HTMLDivElement>();

	function marcadoQr(): string | null {
		const svg = qr?.querySelector('svg');
		if (!svg) return null;
		return svg.outerHTML.includes('xmlns=')
			? svg.outerHTML
			: svg.outerHTML.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
	}

	function descargarSvg() {
		const marcado = marcadoQr();
		if (marcado)
			downloadBlob(new Blob([marcado], { type: 'image/svg+xml' }), `${tarjeta.slug}-qr.svg`);
	}

	/** PNG de 1024 px para imprenta o redes */
	async function descargarPng() {
		const marcado = marcadoQr();
		if (!marcado) return;
		const imagen = new Image();
		imagen.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(marcado)}`;
		await imagen.decode();
		const lienzo = document.createElement('canvas');
		lienzo.width = lienzo.height = 1024;
		const contexto = lienzo.getContext('2d');
		if (!contexto) return;
		contexto.fillStyle = '#ffffff';
		contexto.fillRect(0, 0, 1024, 1024);
		contexto.drawImage(imagen, 0, 0, 1024, 1024);
		lienzo.toBlob((blob) => blob && downloadBlob(blob, `${tarjeta.slug}-qr.png`), 'image/png');
	}

	async function descargarContacto() {
		const foto = await fotoParaVCard(fotoDeContacto(tarjeta));
		downloadBlob(
			new Blob([generarVCard(editor.vistaPrevia, url, foto)], {
				type: 'text/vcard;charset=utf-8'
			}),
			nombreArchivoVcf(tarjeta)
		);
	}

	const mensajeWhatsapp = $derived(
		`https://wa.me/?text=${encodeURIComponent(`Esta es mi tarjeta: ${nombreCompleto(tarjeta)}. ${url}`)}`
	);
</script>

<EditorPanel
	titulo="Compartir"
	descripcion="Tu enlace, tu código QR y el contacto que se guardan tus clientes."
	{alVolver}
>
	<div class="space-y-8">
		{#if !tarjeta.is_public && !editor.bloqueo}
			<AlertBox variant="warning" title="Tu tarjeta está en borrador">
				Solo tú la ves. Publícala para que el enlace y el QR funcionen para tus clientes.
				{#snippet accion()}{@render publicar('sm')}{/snippet}
			</AlertBox>
		{:else if !tarjeta.is_public && editor.bloqueo}
			<AvisoPublicacion
				bloqueo={editor.bloqueo}
				modo={editor.modo}
				cuenta={editor.cuenta}
				slug={tarjeta.slug}
			/>
		{/if}

		<section aria-labelledby="enlace-titulo">
			<h3 id="enlace-titulo" class="font-display text-base font-semibold">Enlace</h3>
			<div
				class="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-light-four/40 p-3 dark:border-dark-one_d"
			>
				<EnlacePublico slug={tarjeta.slug} publicada={tarjeta.is_public} class="min-w-0 flex-1" />
				<Button
					variant="secondary"
					size="sm"
					href={resolve('/[slug]', { slug: tarjeta.slug })}
					target="_blank"
					rel="noopener"
				>
					{#snippet leftIcon()}<ExternalLinkIcon class="size-4" />{/snippet}
					Abrir
				</Button>
				<Button
					variant="secondary"
					size="sm"
					href={mensajeWhatsapp}
					target="_blank"
					rel="noopener noreferrer"
				>
					{#snippet leftIcon()}<WhatsappIcon class="size-4" />{/snippet}
					Enviar por WhatsApp
				</Button>
			</div>
		</section>

		<section
			aria-labelledby="qr-titulo"
			class="grid gap-6 sm:grid-cols-[13rem_1fr] sm:items-center"
		>
			<div bind:this={qr} class="rounded-2xl bg-white p-3 ring-1 ring-light-four/40">
				<QrCode value={urlQr} label="Código QR que abre {url}" class="w-full" />
			</div>
			<div>
				<h3 id="qr-titulo" class="font-display text-base font-semibold">Código QR</h3>
				<p class="mt-1 max-w-[46ch] text-sm text-light-two_d dark:text-dark-two_d">
					Para tu tarjeta impresa, tu consultorio o tu firma de correo. Siempre negro sobre blanco:
					así lo lee cualquier celular.
				</p>
				<div class="mt-4 flex flex-wrap gap-2">
					<Button variant="secondary" size="sm" onclick={descargarPng}>
						{#snippet leftIcon()}<DownloadIcon class="size-4" />{/snippet}
						Descargar PNG
					</Button>
					<Button variant="secondary" size="sm" onclick={descargarSvg}>
						{#snippet leftIcon()}<DownloadIcon class="size-4" />{/snippet}
						Descargar SVG para imprenta
					</Button>
				</div>
			</div>
		</section>

		<section aria-labelledby="vcf-titulo">
			<h3 id="vcf-titulo" class="font-display text-base font-semibold">Contacto para la agenda</h3>
			<p class="mt-1 max-w-[56ch] text-sm text-light-two_d dark:text-dark-two_d">
				Es lo que se guarda cuando tocan «Guardar contacto»: nombre, cargo, empresa, teléfonos,
				correos, dirección, redes y foto.
			</p>
			<Button variant="secondary" size="sm" class="mt-4" onclick={descargarContacto}>
				{#snippet leftIcon()}<AddressBookIcon class="size-4" />{/snippet}
				Descargar y revisar mi contacto
			</Button>
		</section>
	</div>
</EditorPanel>
