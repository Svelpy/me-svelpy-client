<!--
	Pagos de planes: fecha, cuenta, plan, monto, método y el periodo que sumaron. Una anulación es
	su propia fila (monto con signo menos) y el pago anulado queda marcado. "Anular" confirma cuántos
	días se descuentan del plan.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge, ModalConfirm } from '#lib/components/ui/index.ts';
	import { METODO_PAGO_LABEL } from '#lib/constants/data.ts';
	import { ExternalLinkIcon } from '#lib/icons/outline/index.ts';
	import type { PagoListItem } from '#lib/interfaces/index.ts';
	import { errorService, pagoService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { formatFechaCorta, formatearMonto } from '#lib/utils/plan.ts';
	import { diasDelPeriodo, idsAnulados, montoAbsoluto } from './pagos.ts';

	interface Props {
		pagos: PagoListItem[];
		/** Sin la columna de la cuenta (en el detalle de una cuenta ya se sabe de quién son) */
		sinCuenta?: boolean;
		/** Puede anular (admin y superadmin) */
		puedeAnular?: boolean;
		onAnulado?: () => void;
	}

	let { pagos, sinCuenta = false, puedeAnular = false, onAnulado }: Props = $props();

	const anulados = $derived(idsAnulados(pagos));

	let porAnular = $state<PagoListItem | null>(null);
	let anulando = $state(false);

	async function anular() {
		const pago = porAnular;
		if (!pago) return;
		anulando = true;
		try {
			await pagoService.anular(pago.id);
			alert('success', 'Pago anulado');
			porAnular = null;
			onAnulado?.();
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			anulando = false;
		}
	}

	const periodo = (pago: PagoListItem) =>
		`${formatFechaCorta(pago.periodo_inicio)} – ${formatFechaCorta(pago.periodo_fin)}`;
	const boton =
		'rounded text-sm font-semibold underline decoration-light-four underline-offset-4 hover:decoration-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:decoration-dark-four dark:hover:decoration-dark-two dark:focus-visible:outline-dark-three';
</script>

{#snippet monto(pago: PagoListItem)}
	<span
		class={[
			'tabular-nums',
			pago.reverses_id ? 'text-light-two_d dark:text-dark-two_d' : 'font-semibold'
		]}
	>
		{pago.reverses_id ? '−' : ''}{formatearMonto(montoAbsoluto(pago.monto), pago.moneda)}
	</span>
{/snippet}

{#snippet estado(pago: PagoListItem)}
	{#if pago.reverses_id}
		<Badge variant="outline" size="sm">Anulación</Badge>
	{:else if anulados.has(pago.id)}
		<Badge variant="warning" size="sm">Anulado</Badge>
	{/if}
{/snippet}

{#snippet acciones(pago: PagoListItem)}
	<span class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
		{#if pago.comprobante_url}
			<a
				href={pago.comprobante_url}
				target="_blank"
				rel="external noopener noreferrer"
				class="inline-flex items-center gap-1 {boton}"
			>
				Comprobante
				<ExternalLinkIcon class="size-3.5" />
			</a>
		{/if}
		{#if puedeAnular && !pago.reverses_id && !anulados.has(pago.id)}
			<button type="button" class={boton} onclick={() => (porAnular = pago)}>Anular</button>
		{/if}
	</span>
{/snippet}

<!-- Escritorio: tabla -->
<div
	class="hidden overflow-x-auto rounded-2xl border border-light-four/40 md:block dark:border-dark-one_d"
>
	<table class="w-full min-w-[46rem] text-sm">
		<thead
			class="bg-light-one_d/60 text-left text-xs font-semibold text-light-two_d dark:bg-dark-one_d/40 dark:text-dark-two_d"
		>
			<tr>
				<th scope="col" class="px-4 py-3">Fecha</th>
				{#if !sinCuenta}<th scope="col" class="px-4 py-3">Cuenta</th>{/if}
				<th scope="col" class="px-4 py-3">Plan</th>
				<th scope="col" class="px-4 py-3 text-right">Monto</th>
				<th scope="col" class="px-4 py-3">Método</th>
				<th scope="col" class="px-4 py-3">Periodo</th>
				<th scope="col" class="px-4 py-3"><span class="sr-only">Acciones</span></th>
			</tr>
		</thead>
		<tbody>
			{#each pagos as pago (pago.id)}
				<tr class="border-t border-light-four/35 align-top dark:border-dark-one_d">
					<td class="px-4 py-3 whitespace-nowrap tabular-nums">
						{formatFechaCorta(pago.created_at)}
						<span class="mt-1 block">{@render estado(pago)}</span>
					</td>
					{#if !sinCuenta}
						<td class="max-w-56 truncate px-4 py-3">
							<a
								href={resolve('/panel/usuarios/[id]', { id: pago.user_id })}
								class="font-medium hover:underline"
							>
								{pago.user.email}
							</a>
						</td>
					{/if}
					<td class="px-4 py-3">{pago.plan.nombre}</td>
					<td class="px-4 py-3 text-right">{@render monto(pago)}</td>
					<td class="px-4 py-3 text-light-two_d dark:text-dark-two_d">
						{METODO_PAGO_LABEL[pago.metodo]}
						{#if pago.referencia_externa}
							<span class="block font-mono text-xs">{pago.referencia_externa}</span>
						{/if}
					</td>
					<td
						class="px-4 py-3 whitespace-nowrap text-light-two_d tabular-nums dark:text-dark-two_d"
					>
						{periodo(pago)}
					</td>
					<td class="px-4 py-3 text-right">{@render acciones(pago)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Celular: una fila por pago -->
<ul
	class="divide-y divide-light-four/35 rounded-2xl border border-light-four/40 md:hidden dark:divide-dark-one_d dark:border-dark-one_d"
>
	{#each pagos as pago (pago.id)}
		<li class="space-y-1.5 px-4 py-3 text-sm">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0">
					{#if !sinCuenta}
						<a
							href={resolve('/panel/usuarios/[id]', { id: pago.user_id })}
							class="block truncate font-medium hover:underline"
						>
							{pago.user.email}
						</a>
					{/if}
					<p class="text-light-two_d dark:text-dark-two_d">
						{pago.plan.nombre}, {METODO_PAGO_LABEL[pago.metodo]}, {formatFechaCorta(
							pago.created_at
						)}
					</p>
				</div>
				{@render monto(pago)}
			</div>
			<p class="text-xs text-light-two_d tabular-nums dark:text-dark-two_d">{periodo(pago)}</p>
			<div class="flex items-center justify-between gap-3">
				{@render estado(pago)}
				{@render acciones(pago)}
			</div>
		</li>
	{/each}
</ul>

<ModalConfirm
	isOpen={porAnular !== null}
	title="¿Anular el pago de {porAnular
		? formatearMonto(montoAbsoluto(porAnular.monto), porAnular.moneda)
		: ''}?"
	message={porAnular
		? `Se descuentan ${diasDelPeriodo(porAnular)} días del plan de ${porAnular.user.email}. Si el plan queda vencido, su tarjeta deja de verse. El pago queda en la lista, marcado como anulado.`
		: ''}
	confirmLabel="Anular pago"
	loading={anulando}
	onConfirm={anular}
	onCancel={() => (porAnular = null)}
/>
