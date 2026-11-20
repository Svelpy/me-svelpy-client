<!--
	Editor de una tarjeta: índice de partes y secciones, el formulario de la parte abierta y el espejo
	(la tarjeta tal como la verá el cliente). Lo usan el owner (su tarjeta) y el superadmin.
	La parte abierta va en `?seccion=` para poder compartirla y volver con el botón atrás.
	Es un contenedor: con espacio muestra las tres columnas; en el celular, índice → formulario.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { ResolvedPathname } from '$app/types';
	import EnlacePublico from '../panel/enlacePublico.svelte';
	import { CamposPlan, EstadoPlan } from '../planes/index.ts';
	import { AlertBox, Avatar, Button, Sheet } from '#lib/components/ui/index.ts';
	import { diasParaVencer, Plan, planVigente, vencePronto } from '#lib/config/planes.config.ts';
	import { SECCIONES_ORDEN_POR_DEFECTO } from '#lib/config/seccionesTarjeta.config.ts';
	import { DeviceMobileIcon } from '#lib/icons/outline/index.ts';
	import type { TarjetaCompleta } from '#lib/interfaces/index.ts';
	import { ErrorCode } from '#lib/interfaces/error.interface.ts';
	import { AppError, errorService, tarjetaService, usuarioService } from '#lib/services/index.ts';
	import { usuarioUpdateSchema } from '#lib/zod/usuario.schema.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { cn } from '#lib/utils/cn.ts';
	import {
		formatVencimiento,
		planDelFormulario,
		textoDiasRestantes,
		urlActivarPro,
		vencimientoAFecha
	} from '#lib/utils/plan.ts';
	import { nombreCompleto } from '#lib/utils/tarjeta.ts';
	import {
		EditorTarjeta,
		PANELES_TARJETA,
		setEditor,
		type PanelEditor
	} from './estadoEditor.svelte.ts';
	import EspejoTelefono from './espejoTelefono.svelte';
	import { EstadoFormulario } from './estadoFormulario.svelte.ts';
	import AccionesPane from './panes/accionesPane.svelte';
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
		modo: 'owner' | 'admin';
		/** URL de la página (resuelta): los paneles se abren con `?seccion=` */
		base: ResolvedPathname;
		/** Cada vez que se guarda algo (el owner sincroniza su sesión) */
		onActualizada?: (tarjeta: TarjetaCompleta) => void;
		/** Bajo el nombre (p. ej. el propietario, para el superadmin) */
		encabezado?: Snippet;
		/** Junto a "Publicar" (p. ej. eliminar, para el superadmin) */
		acciones?: Snippet;
		class?: string;
	}

	let {
		tarjeta,
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
		try {
			const respuesta = await tarjetaService.publicar(editor.tarjeta.id, !editor.tarjeta.is_public);
			editor.actualizar(respuesta);
			alert('success', respuesta.is_public ? 'Tarjeta publicada' : 'La tarjeta pasó a borrador');
		} catch (causa) {
			// El plan venció mientras el panel estaba abierto: se muestra como Free
			if (causa instanceof AppError && causa.code === ErrorCode.PLAN_REQUERIDO) {
				editor.actualizar({
					propietario: { ...editor.tarjeta.propietario, plan: Plan.FREE, plan_vence_at: null }
				});
			}
			alert('error', errorService.getMessage(causa));
		} finally {
			publicando = false;
		}
	}

	// Plan del dueño: sin Pro no se publica; un Pro que vence pronto se avisa
	const propietario = $derived(editor.tarjeta.propietario);
	const avisarVencimiento = $derived(vencePronto(propietario));
	const diasRestantes = $derived(diasParaVencer(propietario));
	const proUrl = $derived(urlActivarPro(editor.tarjeta.slug));

	// Superadmin: cambiar el plan de la cuenta sin salir del editor
	let editandoPlan = $state(false);
	let plan = $state<Plan>(Plan.FREE);
	let vence = $state('');
	const formPlan = new EstadoFormulario();

	function abrirPlan() {
		plan = planVigente(propietario);
		vence = plan === Plan.PRO ? vencimientoAFecha(propietario.plan_vence_at) : '';
		formPlan.limpiar();
		editandoPlan = true;
	}

	function guardarPlan(event: SubmitEvent) {
		event.preventDefault();
		formPlan.enviar(usuarioUpdateSchema, planDelFormulario(plan, vence), async (validos) => {
			const cuenta = await usuarioService.actualizar(propietario.id, validos);
			// Pasar a Free despublica la tarjeta: se toma el estado que devolvió el servidor
			editor.actualizar({
				propietario: { ...propietario, plan: cuenta.plan, plan_vence_at: cuenta.plan_vence_at },
				is_public: cuenta.tarjeta?.is_public ?? editor.tarjeta.is_public
			});
			editandoPlan = false;
			alert('success', cuenta.plan === Plan.PRO ? 'Plan Pro guardado' : 'Plan Free guardado');
		});
	}

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
	El naranja de la pantalla: publicar es lo que importa mientras es borrador. Sin plan Pro, la misma
	acción lleva a activarlo (el owner por WhatsApp; el superadmin cambia el plan aquí mismo).
-->
{#snippet botonPublicar(size: 'sm' | 'md' = 'md')}
	{#if editor.tarjeta.is_public}
		<Button variant="secondary" {size} loading={publicando} onclick={alternarPublicacion}>
			Pasar a borrador
		</Button>
	{:else if editor.conPlanPro}
		<Button variant="accent" {size} loading={publicando} onclick={alternarPublicacion}>
			Publicar tarjeta
		</Button>
	{:else if modo === 'owner'}
		<Button
			variant="accent"
			{size}
			href={proUrl}
			target="_blank"
			rel="external noopener noreferrer"
		>
			Activar Pro para publicar
		</Button>
	{:else}
		<Button variant="accent" {size} onclick={abrirPlan}>Activar Pro para publicar</Button>
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
				<EstadoPlan cuenta={propietario} />
				{#if modo === 'admin'}
					<button
						type="button"
						onclick={abrirPlan}
						class="rounded font-semibold underline decoration-light-four underline-offset-4 hover:decoration-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:decoration-dark-four dark:hover:decoration-dark-two dark:focus-visible:outline-dark-three"
					>
						Cambiar plan
					</button>
				{/if}
			</p>
			{#if encabezado}{@render encabezado()}{/if}
		</div>
		<div class="flex flex-wrap gap-2">
			{#if acciones}{@render acciones()}{/if}
			{@render botonPublicar()}
		</div>
	</header>

	{#if avisarVencimiento && diasRestantes !== null && propietario.plan_vence_at}
		<AlertBox
			variant="warning"
			title={modo === 'owner'
				? `Tu plan Pro vence ${textoDiasRestantes(diasRestantes)}`
				: `El plan Pro de esta cuenta vence ${textoDiasRestantes(diasRestantes)}`}
			class="mt-6"
		>
			El {formatVencimiento(propietario.plan_vence_at)}
			{modo === 'owner' ? 'tu tarjeta' : 'la tarjeta'} vuelve a borrador y deja de verse hasta que
			{modo === 'owner' ? 'lo renueves' : 'se renueve'}.
			{#snippet accion()}
				{#if modo === 'owner'}
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
					<Button variant="secondary" size="sm" onclick={abrirPlan}>Cambiar plan</Button>
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
				{:else if activo === 'acciones'}
					<AccionesPane alVolver={volver} />
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
		{modo === 'owner' ? 'Ver mi tarjeta' : 'Ver la tarjeta'}
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

	{#if modo === 'admin'}
		<Sheet
			open={editandoPlan}
			title="Plan de la cuenta"
			description={propietario.email}
			onClose={() => (editandoPlan = false)}
			dismissible={!formPlan.enviando}
		>
			<form id="form-plan-tarjeta" onsubmit={guardarPlan} novalidate class="space-y-5">
				{#if formPlan.error}<AlertBox variant="error">{formPlan.error}</AlertBox>{/if}
				<CamposPlan bind:plan bind:vence errores={formPlan.errores} />
				{#if plan === Plan.FREE && editor.tarjeta.is_public}
					<AlertBox variant="warning">Al pasar a Free, su tarjeta vuelve a borrador.</AlertBox>
				{/if}
			</form>
			{#snippet footer()}
				<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button variant="secondary" onclick={() => (editandoPlan = false)}>Cancelar</Button>
					<Button type="submit" form="form-plan-tarjeta" loading={formPlan.enviando}>
						Guardar plan
					</Button>
				</div>
			{/snippet}
		</Sheet>
	{/if}
</div>
