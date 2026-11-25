<!--
	La tarjeta de un profesional con SU paleta y SU tipografía (variables --t-*). La usan la página
	pública (`/[slug]`), el espejo del editor y la vista previa del directorio.
	Es un contenedor (@container): en una pantalla ancha pasa a dos columnas; en el espejo del
	panel (angosto) queda en una, como en el celular.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { DownloadIcon, QrcodeIcon, ShareIcon } from '#lib/icons/outline/index.ts';
	import { LOGOS_ME } from '#lib/constants/assets.ts';
	import { tipografiaPorId } from '#lib/config/tipografiasTarjeta.config.ts';
	import type { SeccionClave, TarjetaPublica } from '#lib/interfaces/index.ts';
	import { QrCode } from '#lib/components/ui/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { enlaceAgenda, nombreCompleto, tituloSeccion } from '#lib/utils/tarjeta.ts';
	import { variablesTema } from '#lib/utils/temaTarjeta.ts';
	import { urlPublicaTarjeta, urlQrTarjeta } from '#lib/utils/urlPublica.ts';
	import GuardarContacto from './guardarContacto.svelte';
	import AcercaSeccion from './secciones/acercaSeccion.svelte';
	import CertificacionesSeccion from './secciones/certificacionesSeccion.svelte';
	import ContactoSeccion from './secciones/contactoSeccion.svelte';
	import EducacionSeccion from './secciones/educacionSeccion.svelte';
	import FaqSeccion from './secciones/faqSeccion.svelte';
	import RedesSeccion from './secciones/redesSeccion.svelte';
	import UbicacionSeccion from './secciones/ubicacionSeccion.svelte';
	import VitrinaSeccion from './secciones/vitrinaSeccion.svelte';
	import TarjetaFab from './tarjetaFab.svelte';
	import TarjetaFuentes from './tarjetaFuentes.svelte';
	import TarjetaPortada from './tarjetaPortada.svelte';
	import TarjetaHoja from './ui/tarjetaHoja.svelte';

	interface Props {
		/** La forma pública (`GET /tarjetas/public/{slug}`, o `aPublica()` en el editor): solo lo visible, en orden */
		tarjeta: TarjetaPublica;
		/** vista-previa: inerte (no se navega desde el panel) y sin landmarks de página */
		modo?: 'publica' | 'vista-previa';
		class?: string;
	}

	let { tarjeta, modo = 'publica', class: className }: Props = $props();

	const tema = $derived(tarjeta.theme);
	const tipografia = $derived(tipografiaPorId(tema.tipografia));
	const estilo = $derived(variablesTema(tema, tema.tipografia));
	const url = $derived(urlPublicaTarjeta(tarjeta.slug));
	// El QR abre /t/{id}: sigue funcionando impreso aunque la tarjeta cambie de enlace
	const urlQr = $derived(urlQrTarjeta(tarjeta.id));
	const agenda = $derived(enlaceAgenda(tarjeta.redes));
	const publica = $derived(modo === 'publica');

	let hoja = $state<'qr' | 'pago' | null>(null);
	let aviso = $state('');

	/** Secciones visibles pero sin nada que mostrar no se pintan */
	function tieneContenido(clave: SeccionClave): boolean {
		switch (clave) {
			case 'acerca':
				return !!tarjeta.acerca_de_mi?.trim();
			case 'contacto':
				return tarjeta.contactos.length > 0 || !!agenda || !!tarjeta.qr_pago_url;
			case 'vitrina':
				return tarjeta.vitrina.items.length > 0;
			case 'ubicacion':
				return tarjeta.ubicaciones.length > 0;
			case 'redes':
				return tarjeta.redes.length > 0;
			case 'educacion':
				return tarjeta.educaciones.length > 0;
			case 'certificaciones':
				return tarjeta.certificaciones.length > 0;
			case 'faq':
				return tarjeta.faqs.length > 0;
		}
	}

	async function compartir() {
		const datos = { title: nombreCompleto(tarjeta), text: tarjeta.cargo ?? tarjeta.rubro, url };
		if (navigator.share) {
			try {
				await navigator.share(datos);
			} catch {
				// Cancelado por la persona
			}
			return;
		}
		try {
			await navigator.clipboard.writeText(url);
			aviso = 'Enlace copiado. Ya puedes pegarlo donde quieras.';
		} catch {
			aviso = url;
		}
		setTimeout(() => (aviso = ''), 3500);
	}

	function descargarQr() {
		const svg = document.querySelector<SVGElement>('[data-qr-tarjeta] svg');
		if (!svg) return;
		const marcado = svg.outerHTML.includes('xmlns=')
			? svg.outerHTML
			: svg.outerHTML.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
		const blob = new Blob([marcado], { type: 'image/svg+xml' });
		const enlace = document.createElement('a');
		enlace.href = URL.createObjectURL(blob);
		enlace.download = `${tarjeta.slug}-qr.svg`;
		enlace.click();
		setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
	}
</script>

<TarjetaFuentes tipografias={[tipografia]} />

<div
	data-area="tarjeta"
	data-testid="tarjeta-vista"
	style={estilo}
	inert={!publica || undefined}
	class={cn(
		'@container min-h-full bg-t-fondo font-t-texto text-t-texto antialiased',
		publica && 'relative',
		className
	)}
>
	<div
		class="mx-auto w-full max-w-[30rem] @4xl:grid @4xl:max-w-6xl @4xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] @4xl:items-start @4xl:gap-14 @4xl:px-8 @4xl:py-12"
	>
		<div
			class="@4xl:sticky @4xl:top-12 @4xl:overflow-hidden @4xl:rounded-[1.75rem] @4xl:border @4xl:border-t-borde @4xl:bg-t-superficie @4xl:pb-7"
		>
			<TarjetaPortada {tarjeta} nivel={publica ? 'h1' : 'h2'} />
			<GuardarContacto {tarjeta} {url} />
		</div>

		<svelte:element
			this={publica ? 'main' : 'div'}
			class="space-y-10 px-5 pt-9 pb-32 @4xl:px-0 @4xl:pt-2"
		>
			{#each tarjeta.secciones as seccion (seccion.clave)}
				{#if tieneContenido(seccion.clave)}
					{@const titulo = tituloSeccion(seccion)}
					{#if seccion.clave === 'acerca'}
						<AcercaSeccion {titulo} texto={tarjeta.acerca_de_mi ?? ''} />
					{:else if seccion.clave === 'vitrina'}
						<VitrinaSeccion {titulo} vitrina={tarjeta.vitrina} contactos={tarjeta.contactos} />
					{:else if seccion.clave === 'ubicacion'}
						<UbicacionSeccion {titulo} ubicaciones={tarjeta.ubicaciones} />
					{:else if seccion.clave === 'contacto'}
						<ContactoSeccion
							{titulo}
							contactos={tarjeta.contactos}
							forma={tema.icono_forma}
							{agenda}
							onPagar={tarjeta.qr_pago_url ? () => (hoja = 'pago') : undefined}
						/>
					{:else if seccion.clave === 'redes'}
						<RedesSeccion {titulo} redes={tarjeta.redes} forma={tema.icono_forma} />
					{:else if seccion.clave === 'educacion'}
						<EducacionSeccion {titulo} educaciones={tarjeta.educaciones} />
					{:else if seccion.clave === 'certificaciones'}
						<CertificacionesSeccion
							{titulo}
							certificaciones={tarjeta.certificaciones}
							forma={tema.icono_forma}
						/>
					{:else if seccion.clave === 'faq'}
						<FaqSeccion {titulo} faqs={tarjeta.faqs} />
					{/if}
				{/if}
			{/each}

			<footer
				class="flex flex-col items-center gap-4 border-t border-t-borde pt-8 text-sm text-t-texto-sec"
			>
				<div class="flex flex-wrap justify-center gap-2">
					<button
						type="button"
						onclick={compartir}
						class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold text-t-texto focus-visible:outline-2 focus-visible:outline-t-primario"
					>
						<ShareIcon class="size-5" />
						Compartir
					</button>
					<button
						type="button"
						onclick={() => (hoja = 'qr')}
						class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold text-t-texto focus-visible:outline-2 focus-visible:outline-t-primario"
					>
						<QrcodeIcon class="size-5" />
						Código QR
					</button>
				</div>
				<a
					href={resolve('/')}
					class="inline-flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-t-primario"
				>
					<img src={LOGOS_ME.isotipoClaro} alt="" width="24" height="14" class="h-3.5 w-auto" />
					Tarjeta creada con <span class="font-semibold text-t-texto">ME by Svelpy</span>
				</a>
			</footer>
		</svelte:element>
	</div>

	<TarjetaFab
		contactos={tarjeta.contactos}
		lado={tema.fab_posicion}
		modo={publica ? 'fija' : 'absoluta'}
	/>

	{#if aviso}
		<p
			role="status"
			class="fixed inset-x-5 bottom-24 z-40 mx-auto max-w-sm rounded-2xl bg-t-titulo px-4 py-3 text-center text-sm font-medium text-t-fondo shadow-lg"
		>
			{aviso}
		</p>
	{/if}

	<TarjetaHoja
		open={hoja === 'qr'}
		titulo="Código QR de esta tarjeta"
		onClose={() => (hoja = null)}
	>
		<div class="rounded-2xl bg-white p-4" data-qr-contenedor>
			<span data-qr-tarjeta class="contents">
				<QrCode
					value={urlQr}
					label="Código QR que abre la tarjeta de {nombreCompleto(tarjeta)}"
					class="mx-auto w-full max-w-64"
				/>
			</span>
		</div>
		<p class="mt-3 text-center text-sm text-t-texto-sec">
			Escanéalo con la cámara del celular para abrir esta tarjeta.
		</p>
		<button
			type="button"
			onclick={descargarQr}
			class="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-t-secundario font-semibold text-t-sobre-secundario"
		>
			<DownloadIcon class="size-5" />
			Descargar QR
		</button>
	</TarjetaHoja>

	{#if tarjeta.qr_pago_url}
		<TarjetaHoja open={hoja === 'pago'} titulo="Pagar con QR" onClose={() => (hoja = null)}>
			<img
				src={tarjeta.qr_pago_url}
				alt="QR de pago de {nombreCompleto(tarjeta)}"
				class="mx-auto w-full max-w-72 rounded-2xl bg-white p-3"
			/>
			<p class="mt-3 text-center text-sm text-t-texto-sec">Escanéalo desde la app de tu banco.</p>
		</TarjetaHoja>
	{/if}
</div>
