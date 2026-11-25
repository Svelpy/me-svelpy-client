<!--
	El plan de una cuenta en palabras. Lo normal va callado; lo que pide atención (un plan pago que
	vence pronto o ya venció) lleva el punto de aviso. `celda`: en dos líneas, para tablas y listas.
-->
<script lang="ts">
	import { estadoPlan, type CuentaConPlan } from '#lib/config/planes.config.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { formatVencimiento, textoDiasRestantes } from '#lib/utils/plan.ts';

	interface Props {
		cuenta: CuentaConPlan;
		variante?: 'linea' | 'celda';
		class?: string;
	}

	let { cuenta, variante = 'linea', class: className }: Props = $props();

	const estado = $derived(estadoPlan(cuenta));
	const avisar = $derived(
		estado.tipo === 'vencido' || (estado.tipo === 'vigente' && estado.vencePronto)
	);

	/** Lo que sigue al nombre del plan */
	const detalle = $derived.by(() => {
		if (estado.tipo === 'free') return null;
		if (estado.tipo === 'vencido') return `venció el ${formatVencimiento(cuenta.plan_vence_at)}`;
		if (estado.vencePronto) return `vence ${textoDiasRestantes(estado.dias)}`;
		return `hasta el ${formatVencimiento(cuenta.plan_vence_at)}`;
	});
</script>

{#snippet punto()}
	<span
		class="size-1.5 shrink-0 rounded-full bg-light-warning dark:bg-dark-warning"
		aria-hidden="true"
	></span>
{/snippet}

{#if variante === 'celda'}
	<span class={cn('flex flex-col', className)}>
		<span class={estado.tipo === 'free' ? 'text-light-two_d dark:text-dark-two_d' : 'font-medium'}>
			{cuenta.plan.nombre}
		</span>
		{#if detalle}
			<span
				class={cn(
					'inline-flex items-center gap-1.5 text-xs',
					avisar
						? 'font-medium text-light-two dark:text-dark-two'
						: 'text-light-two_d dark:text-dark-two_d'
				)}
			>
				{#if avisar}{@render punto()}{/if}
				{detalle}
			</span>
		{/if}
	</span>
{:else}
	<span
		class={cn(
			'inline-flex items-center gap-1.5',
			avisar ? 'font-medium' : 'text-light-two_d dark:text-dark-two_d',
			className
		)}
	>
		{#if avisar}{@render punto()}{/if}
		Plan {cuenta.plan.nombre}{detalle ? `, ${detalle}` : ''}
	</span>
{/if}
