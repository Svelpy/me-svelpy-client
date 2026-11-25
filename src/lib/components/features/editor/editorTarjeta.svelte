<!--
	Editor de una tarjeta: índice de partes y secciones, el formulario de la parte abierta y el espejo
	(la tarjeta tal como la verá el cliente). Lo usan el user (su tarjeta) y los admins.
	La parte abierta va en `?seccion=` para poder compartirla y volver con el botón atrás.
	Es un contenedor: con espacio muestra las tres columnas; en el celular, índice → formulario.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import EnlacePublico from '../panel/enlacePublico.svelte';
	import { AvisoPublicacion, EstadoPlan } from '../planes/index.ts';
	import { AlertBox, Avatar, Button, Sheet } from '#lib/components/ui/index.ts';
	import { diasParaVencer, vencePronto } from '#lib/config/planes.config.ts';
	import { SECCIONES_ORDEN_POR_DEFECTO } from '#lib/config/seccionesTarjeta.config.ts';
	import { DeviceMobileIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaCompleta, UsuarioDetalle } from '#lib/interfaces/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { formatVencimiento, textoDiasRestantes, urlActivarPro } from '#lib/utils/plan.ts';
	import { rutaConQuery } from '#lib/utils/resolveRoute.ts';
	import { nombreCompleto } from '#lib/utils/tarjeta.ts';
	import {
		EditorTarjeta,
		PANELES_TARJETA,
		setEditor,
		type PanelEditor
	} from './estadoEditor.svelte.ts';
	import EspejoTelefono from './espejoTelefono.svelte';
	import AcercaPane from './panes/acercaPane.svelte';
	import AparienciaPane from './panes/aparienciaPane.svelte';
	import CompartirPane from './panes/compartirPane.svelte';
	import ContactoPane from './panes/contactoPane.svelte';
	import FormacionPanes from './panes/formacionPanes.svelte';
	import PerfilPane from './panes/perfilPane.svelte';
	import RedesPane from './panes/redesPane.svelte';
	import SeoPane from './panes/seoPane.svelte';
	import UbicacionPane from './panes/ubicacionPane.svelte';
	import VitrinaPane from './panes/vitrinaPane.svelte';
	import SeccionesNav from './seccionesNav.svelte';

	interface Props {
		tarjeta: TarjetaCompleta;
		/** El dueño de la tarjeta: su plan, su email verificado y si está activo deciden si se publica */
		cuenta: UsuarioDetalle;
		modo: 'user' | 'admin';
		/** URL de la página (resuelta): los paneles se abren con `?seccion=` */
		base: ResolvedPathname;
		/** Cada vez que se guarda algo (el user sincroniza su sesión) */
		onActualizada?: (tarjeta: TarjetaCompleta) => void;
		/** Bajo el nombre (p. ej. la cuenta dueña, para los admins) */
		encabezado?: Snippet;
		/** Junto a "Publicar" (p. ej. eliminar, para el superadmin) */
		acciones?: Snippet;
		class?: string;
	}

	let {
		tarjeta,
		cuenta,
		modo,
		base,
		onActualizada,
		encabezado,
		acciones,
		class: className
	}: Props = $props();

	const editor = setEditor(
		new EditorTarjeta(
			untrack(() => tarjeta),
			untrack(() => cuenta),
			untrack(() => modo),
			(actual) => onActualizada?.(actual)
		)
	);

	const PANELES = new Set<string>([...PANELES_TARJETA, ...SECCIONES_ORDEN_POR_DEFECTO]);
	const parametro = $derived(page.url.searchParams.get('seccion'));
	const abierto = $derived(parametro && PANELES.has(parametro) ? (parametro as PanelEditor) : null);
	const activo = $derived<PanelEditor>(abierto ?? 'perfil');

	// La base ya viene resuelta: sumarle la sección sigue siendo una ruta resuelta de la app
	const enlace = (panel: PanelEditor) => `${base}?seccion=${panel}` as ResolvedPathname;
	const volver = () => goto(base);

	let publicando = $state(false);
	let verEspejo = $state(false);

	async function alternarPublicacion() {
		publicando = true;
		const publicar = !editor.tarjeta.is_public;
		try {
			if (publicar) await editor.publicar();
			else await editor.despublicar();
			alert('success', publicar ? 'Tarjeta publicada' : 'La tarjeta pasó a borrador');
		} catch (causa) {
			// Un 409 trae el motivo (plan vencido, email sin verificar…) en el mensaje
			alert('error', errorService.getMessage(causa));
		} finally {
			publicando = false;
		}
	}

	// Plan del dueño: lo que vence pronto se avisa antes de que la tarjeta deje de verse
	const avisarVencimiento = $derived(vencePronto(editor.cuenta));
	const diasRestantes = $derived(diasParaVencer(editor.cuenta));
	const registrarPago = $derived(
		rutaConQuery(resolve('/panel/pagos/nuevo'), { usuario: editor.cuenta.id })
	);

	// Cambiar de panel o de página con cambios sin guardar pide confirmación
	beforeNavigate((navegacion) => {
		if (!editor.sinGuardar) return;
		if (navegacion.willUnload) {
			navegacion.cancel();
			return;
		}
		if (!confirm('Tienes cambios sin guardar. ¿Salir sin guardarlos?')) navegacion.cancel();
	});
</script>

<!--
	El naranja de la pantalla: publicar es lo que importa mientras es borrador. Si algo lo impide, el
	aviso bajo el encabezado dice qué y cómo resolverlo.
-->
{#snippet botonPublicar(size: 'sm' | 'md' = 'md')}
	{#if editor.tarjeta.is_public}
		<Button variant="secondary" {size} loading={publicando} onclick={alternarPublicacion}>
			Pasar a borrador
		</Button>
	{:else}
		<Button
			variant="accent"
			{size}
			loading={publicando}
			disabled={editor.bloqueo !== null}
			onclick={alternarPublicacion}
		>
			Publicar tarjeta
		</Button>
	{/if}
{/snippet}

<div class={cn('@container', className)}>
	<header
		class="flex flex-wrap items-center gap-x-5 gap-y-4 border-b border-light-four/40 pb-6 dark:border-dark-one_d"
	>
		<Avatar src={editor.tarjeta.profile_url} nombre={nombreCompleto(editor.tarjeta)} size="lg" />
		<!-- `basis-60`: en el celular las acciones bajan a su propia fila en vez de apretar el nombre -->
		<div class="min-w-0 grow basis-60">
			<h1
				class="font-display text-[1.375rem] leading-tight font-semibold tracking-[-0.01em] text-balance sm:text-[1.625rem]"
			>
				{nombreCompleto(editor.tarjeta)}
			</h1>
			<EnlacePublico
				slug={editor.tarjeta.slug}
				publicada={editor.tarjeta.is_public}
				class="mt-1.5 -ml-1.5"
			/>
			<p class="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
				<EstadoPlan cuenta={editor.cuenta} />
				{#if modo === 'admin'}
					<a
						href={registrarPago}
						class="rounded font-semibold underline decoration-light-four underline-offset-4 hover:decoration-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:decoration-dark-four dark:hover:decoration-dark-two dark:focus-visible:outline-dark-three"
					>
						Registrar pago
					</a>
				{/if}
			</p>
			{#if encabezado}{@render encabezado()}{/if}
		</div>
		<div class="flex flex-wrap gap-2">
			{#if acciones}{@render acciones()}{/if}
			{@render botonPublicar()}
		</div>
	</header>

	{#if !editor.tarjeta.is_public && editor.bloqueo}
		<AvisoPublicacion
			bloqueo={editor.bloqueo}
			{modo}
			cuenta={editor.cuenta}
			slug={editor.tarjeta.slug}
			class="mt-6"
		/>
	{:else if avisarVencimiento && diasRestantes !== null}
		<AlertBox
			variant="warning"
			title={modo === 'user'
				? `Tu plan ${editor.cuenta.plan.nombre} vence ${textoDiasRestantes(diasRestantes)}`
				: `El plan ${editor.cuenta.plan.nombre} de esta cuenta vence ${textoDiasRestantes(diasRestantes)}`}
			class="mt-6"
		>
			El {formatVencimiento(editor.cuenta.plan_vence_at)}
			{modo === 'user' ? 'tu tarjeta' : 'la tarjeta'} vuelve a borrador y deja de verse hasta que
			{modo === 'user' ? 'lo renueves' : 'se renueve'}.
			{#snippet accion()}
				{#if modo === 'user'}
					<Button
						variant="secondary"
						size="sm"
						href={urlActivarPro(editor.tarjeta.slug, true)}
						target="_blank"
						rel="external noopener noreferrer"
					>
						Renovar por WhatsApp
					</Button>
				{:else}
					<Button variant="secondary" size="sm" href={registrarPago}>Registrar pago</Button>
				{/if}
			{/snippet}
		</AlertBox>
	{/if}

	<div
		class="mt-8 grid gap-8 @3xl:grid-cols-[14rem_minmax(0,1fr)] @3xl:gap-10 @5xl:grid-cols-[14rem_minmax(0,1fr)_19rem] @6xl:grid-cols-[16rem_minmax(0,1fr)_22rem]"
	>
		<div class={abierto ? 'hidden @3xl:block' : ''}>
			<div class="@3xl:sticky @3xl:top-24">
				<SeccionesNav {activo} predeterminado={!abierto} {enlace} />
			</div>
		</div>

		<div class={abierto ? 'min-w-0' : 'hidden min-w-0 @3xl:block'}>
			{#key activo}
				{#if activo === 'perfil'}
					<PerfilPane alVolver={volver} />
				{:else if activo === 'apariencia'}
					<AparienciaPane alVolver={volver} />
				{:else if activo === 'compartir'}
					<CompartirPane alVolver={volver} publicar={botonPublicar} />
				{:else if activo === 'seo'}
					<SeoPane alVolver={volver} />
				{:else if activo === 'acerca'}
					<AcercaPane alVolver={volver} />
				{:else if activo === 'contacto'}
					<ContactoPane alVolver={volver} />
				{:else if activo === 'vitrina'}
					<VitrinaPane alVolver={volver} />
				{:else if activo === 'ubicacion'}
					<UbicacionPane alVolver={volver} />
				{:else if activo === 'redes'}
					<RedesPane alVolver={volver} />
				{:else}
					<FormacionPanes tipo={activo} alVolver={volver} />
				{/if}
			{/key}
		</div>

		<div class="hidden @5xl:block">
			<div class="sticky top-24 h-[calc(100dvh-8rem)] max-h-[56rem] min-h-[34rem]">
				<EspejoTelefono
					tarjeta={editor.vistaPrevia}
					sinGuardar={editor.sinGuardar}
					class="h-full"
				/>
			</div>
		</div>
	</div>
	<!-- Deja libre lo último de la página bajo el botón flotante -->
	<div class="h-20 @5xl:hidden" aria-hidden="true"></div>

	<!-- Sin espacio para el espejo: un botón lo abre en una hoja -->
	<button
		type="button"
		onclick={() => (verEspejo = true)}
		class={[
			'fixed right-5 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-light-three px-5 text-sm font-semibold text-light-one shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-light-three @5xl:hidden dark:bg-dark-three dark:text-dark-one dark:focus-visible:outline-dark-three',
			abierto ? 'bottom-24' : 'bottom-5'
		]}
	>
		<DeviceMobileIcon class="size-5" />
		{modo === 'user' ? 'Ver mi tarjeta' : 'Ver la tarjeta'}
	</button>
	<Sheet
		open={verEspejo}
		title="Vista previa de la tarjeta"
		hideTitle
		onClose={() => (verEspejo = false)}
		size="md"
	>
		<!-- Solo mientras está abierta: si no, la página carga dos tarjetas completas -->
		{#if verEspejo}
			<div class="h-[72dvh]">
				<EspejoTelefono
					tarjeta={editor.vistaPrevia}
					sinGuardar={editor.sinGuardar}
					class="h-full"
				/>
			</div>
		{/if}
	</Sheet>
</div>
