<script lang="ts">
	import { DownloadIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaPublica } from '#lib/interfaces/index.ts';
	import { downloadBlob } from '#lib/utils/download.ts';
	import {
		fotoDeContacto,
		fotoParaVCard,
		generarVCard,
		nombreArchivoVcf
	} from '#lib/utils/vcard.ts';
	import TarjetaBoton from './ui/tarjetaBoton.svelte';

	interface Props {
		tarjeta: TarjetaPublica;
		url: string;
	}

	let { tarjeta, url }: Props = $props();

	let preparando = $state(false);

	/** La acción principal de la tarjeta: el contacto queda en la agenda, con foto */
	async function guardar() {
		preparando = true;
		try {
			const foto = await fotoParaVCard(fotoDeContacto(tarjeta));
			const vcf = generarVCard(tarjeta, url, foto);
			downloadBlob(
				new Blob([vcf], { type: 'text/vcard;charset=utf-8' }),
				nombreArchivoVcf(tarjeta)
			);
		} finally {
			preparando = false;
		}
	}
</script>

<div class="px-5 pt-6">
	<TarjetaBoton size="lg" fullWidth icono={DownloadIcon} onclick={guardar} disabled={preparando}>
		Guardar contacto
		<span
			class="rounded-full bg-[color-mix(in_oklab,var(--t-sobre-primario)_18%,transparent)] px-2 py-0.5 font-mono text-xs font-medium"
			aria-hidden="true"
		>
			.vcf
		</span>
	</TarjetaBoton>
</div>
