<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { EstadoFormulario, numeroONull } from '#lib/components/features/editor/index.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { TablaSkeleton } from '#lib/components/skeletons/index.ts';
	import {
		AlertBox,
		Button,
		EmptyState,
		Input,
		PageHeader,
		Sheet,
		Switch
	} from '#lib/components/ui/index.ts';
	import { Action, Module } from '#lib/config/permissions.config.ts';
	import { TicketIcon } from '#lib/icons/outline/index.ts';
	import type { Plan } from '#lib/interfaces/index.ts';
	import { errorService, planService } from '#lib/services/index.ts';
	import { currentRole, planesStore } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { formatDuracion, formatearMonto } from '#lib/utils/plan.ts';
	import { can } from '#lib/utils/rbac.utils.ts';
	import { numeroDe } from '#lib/utils/tarjeta.ts';
	import { planUpdateSchema } from '#lib/zod/pago.schema.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const puedeEditar = $derived(can($currentRole, Module.PLAN, Action.UPDATE));

	let editando = $state<Plan | null>(null);
	let nombre = $state('');
	let precio = $state('');
	let moneda = $state('');
	let dias = $state('');
	let visible = $state(true);
	const estado = new EstadoFormulario();

	function abrir(plan: Plan) {
		editando = plan;
		nombre = plan.nombre;
		precio = String(numeroDe(plan.precio) ?? '');
		moneda = plan.moneda;
		dias = String(plan.duracion_dias);
		visible = plan.is_visible;
		estado.limpiar();
	}

	function guardar(event: SubmitEvent) {
		event.preventDefault();
		const plan = editando;
		if (!plan) return;
		estado.enviar(
			planUpdateSchema,
			{
				nombre,
				precio: numeroONull(precio),
				moneda,
				duracion_dias: numeroONull(dias),
				is_visible: visible
			},
			async (validos) => {
				const actualizado = await planService.actualizar(plan.id, validos);
				planesStore.reemplazar(actualizado);
				editando = null;
				alert('success', 'Plan guardado');
				await invalidate('app:planes');
			}
		);
	}
</script>

<MainLayout title="Planes | Panel ME" noIndex>
	<PageHeader
		title="Planes"
		description="Lo que se cobra y cuánto dura cada plan. Los visibles se muestran en la página de precios."
	/>

	<div class="mt-8">
		{#await data.planes}
			<TablaSkeleton columnas={5} filas={3} etiqueta="Cargando los planes" />
		{:then planes}
			{#if planes.length === 0}
				<EmptyState
					icono={TicketIcon}
					titulo="No hay planes"
					descripcion="El catálogo de planes lo crea el servidor."
				/>
			{:else}
				<ul
					class="divide-y divide-light-four/35 rounded-2xl border border-light-four/40 dark:divide-dark-one_d dark:border-dark-one_d"
				>
					{#each planes as plan (plan.id)}
						<li class="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
							<div class="min-w-0 flex-1">
								<p class="font-display text-lg font-semibold">{plan.nombre}</p>
								<p class="font-mono text-xs text-light-two_d dark:text-dark-two_d">{plan.codigo}</p>
							</div>
							<div class="text-right">
								<p class="font-semibold tabular-nums">{formatearMonto(plan.precio, plan.moneda)}</p>
								<p class="text-xs text-light-two_d dark:text-dark-two_d">
									por {formatDuracion(plan.duracion_dias)}
								</p>
							</div>
							<p class="w-28 text-sm text-light-two_d dark:text-dark-two_d">
								{plan.is_visible ? 'En precios' : 'Oculto'}
							</p>
							{#if puedeEditar}
								<Button variant="secondary" size="sm" onclick={() => abrir(plan)}>Editar</Button>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{:catch error}
			<AlertBox variant="error" title="No se pudieron cargar los planes">
				{errorService.getMessage(error)}
				{#snippet accion()}
					<Button size="sm" variant="secondary" onclick={() => invalidate('app:planes')}>
						Reintentar
					</Button>
				{/snippet}
			</AlertBox>
		{/await}
	</div>
</MainLayout>

<Sheet
	open={editando !== null}
	title="Editar plan"
	description={editando ? `Código ${editando.codigo}: no se cambia.` : undefined}
	onClose={() => (editando = null)}
	dismissible={!estado.enviando}
>
	<form id="form-plan" onsubmit={guardar} novalidate class="space-y-5">
		{#if estado.error && Object.keys(estado.errores).length === 0}
			<AlertBox variant="error">{estado.error}</AlertBox>
		{/if}
		<Input
			label="Nombre"
			required
			maxlength={60}
			bind:value={nombre}
			error={estado.errores.nombre}
		/>
		<div class="grid gap-5 sm:grid-cols-2">
			<Input
				label="Precio"
				required
				inputmode="decimal"
				bind:value={precio}
				error={estado.errores.precio}
			/>
			<Input
				label="Moneda"
				required
				maxlength={3}
				hint="Código de 3 letras: USD, BOB…"
				bind:value={moneda}
				error={estado.errores.moneda}
			/>
		</div>
		<Input
			label="Duración en días"
			required
			inputmode="numeric"
			hint="365 = un año. Cada pago suma estos días al plan."
			bind:value={dias}
			error={estado.errores.duracion_dias}
		/>
		<Switch
			label="Mostrar en la página de precios"
			descripcion="Oculto, se sigue pudiendo registrar sus pagos."
			bind:checked={visible}
		/>
		<p class="text-sm text-light-two_d dark:text-dark-two_d">
			Cambiar el precio no toca los pagos ya registrados.
		</p>
	</form>
	{#snippet footer()}
		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button variant="secondary" onclick={() => (editando = null)}>Cancelar</Button>
			<Button type="submit" form="form-plan" loading={estado.enviando}>Guardar plan</Button>
		</div>
	{/snippet}
</Sheet>
