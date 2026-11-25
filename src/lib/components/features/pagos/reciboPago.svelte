<!--
	El recibo del pago que se está por registrar, armado en vivo con el formulario: lo que se cobra
	(con el precio tachado si hay oferta), cómo pagó y, lo que importa, hasta cuándo queda el plan.
	Es lo que el admin confirma con un vistazo antes de registrar.
-->
<script lang="ts">
	import { METODO_PAGO_LABEL } from '#lib/constants/data.ts';
	import type { MetodoPago, Plan } from '#lib/interfaces/index.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { formatDuracion, formatVencimiento, formatearMonto } from '#lib/utils/plan.ts';
	import { numeroDe } from '#lib/utils/tarjeta.ts';

	interface Props {
		email: string | null;
		plan: Plan | null;
		/** null = el precio del plan */
		monto: number | null;
		metodo: MetodoPago | null;
		referencia: string;
		/** Desde cuándo suma el pago: hoy, o el vencimiento actual si su plan sigue vigente */
		desde: Date;
		class?: string;
	}

	let { email, plan, monto, metodo, referencia, desde, class: className }: Props = $props();

	const precio = $derived(plan ? (numeroDe(plan.precio) ?? 0) : null);
	const cobra = $derived(monto ?? precio);
	const conOferta = $derived(monto !== null && precio !== null && monto < precio);
	const hasta = $derived(
		plan ? new Date(desde.getTime() + plan.duracion_dias * 86_400_000).toISOString() : null
	);
</script>

{#snippet fila(etiqueta: string, valor: string | null, mono = false)}
	<div class="flex items-baseline gap-2 text-sm">
		<dt class="shrink-0 text-light-two_d dark:text-dark-two_d">{etiqueta}</dt>
		<!-- Puntos guía, como en un recibo: unen el dato con su valor -->
		<span
			class="min-w-4 flex-1 translate-y-[-0.2rem] border-b border-dotted border-light-four/70 dark:border-dark-four/60"
			aria-hidden="true"
		></span>
		<dd
			class={cn(
				'max-w-[60%] truncate text-right font-medium',
				mono && 'font-mono text-[0.8125rem]',
				!valor && 'font-normal text-light-four_d dark:text-dark-four_d'
			)}
		>
			{valor ?? 'Falta elegir'}
		</dd>
	</div>
{/snippet}

<section
	aria-label="Recibo del pago"
	aria-live="polite"
	class={cn(
		'rounded-[1.25rem] border border-light-four/45 bg-light-one_d/60 p-5 dark:border-dark-one_d dark:bg-dark-one_d/40',
		className
	)}
>
	<p class="font-display text-sm font-semibold text-light-two_d dark:text-dark-two_d">Recibo</p>

	<dl class="mt-4 space-y-2.5">
		{@render fila('Cuenta', email)}
		{@render fila('Plan', plan ? `${plan.nombre}, ${formatDuracion(plan.duracion_dias)}` : null)}
		{@render fila('Método', metodo ? METODO_PAGO_LABEL[metodo] : null)}
		{#if referencia.trim()}
			{@render fila('Referencia', referencia.trim(), true)}
		{/if}
	</dl>

	<div class="mt-5 border-t border-dashed border-light-four/70 pt-4 dark:border-dark-four/60">
		<div class="flex items-baseline justify-between gap-3">
			<p class="text-sm text-light-two_d dark:text-dark-two_d">Se cobra</p>
			<p class="text-right">
				{#if conOferta && plan && precio !== null}
					<span
						class="mr-2 text-sm text-light-two_d tabular-nums line-through dark:text-dark-two_d"
					>
						<span class="sr-only">Precio de lista </span>{formatearMonto(precio, plan.moneda)}
					</span>
				{/if}
				<span class="font-display text-2xl font-semibold tabular-nums">
					{plan && cobra !== null ? formatearMonto(cobra, plan.moneda) : '—'}
				</span>
			</p>
		</div>
		{#if conOferta}
			<p class="mt-1 text-right text-xs text-light-two_d dark:text-dark-two_d">Precio de oferta</p>
		{/if}
	</div>

	<div class="mt-5 rounded-2xl bg-light-one px-4 py-3.5 dark:bg-dark-one">
		<p class="text-xs text-light-two_d dark:text-dark-two_d">El plan queda vigente hasta</p>
		<p class="mt-0.5 font-display text-xl leading-tight font-semibold text-balance">
			{hasta ? formatVencimiento(hasta) : 'Elige un plan'}
		</p>
		<p class="mt-1 text-xs text-light-two_d dark:text-dark-two_d">
			Fecha estimada: la confirma el servidor al registrar.
		</p>
	</div>
</section>
