<!--
	El plan de una cuenta en palabras. Lo normal va callado; lo que pide atención (un Pro que vence
	pronto) lleva el punto de aviso. `celda`: en dos líneas, para tablas y listas.
-->
<script lang="ts">
	import {
		diasParaVencer,
		Plan,
		planVigente,
		vencePronto,
		type CuentaConPlan
	} from '#lib/config/planes.config.ts';
	import { PLAN_LABEL } from '#lib/constants/data.ts';
	import { cn } from '#lib/utils/cn.ts';
	import { formatVencimiento, textoDiasRestantes } from '#lib/utils/plan.ts';

	interface Props {
		cuenta: CuentaConPlan;
		variante?: 'linea' | 'celda';
		class?: string;
	}

	let { cuenta, variante = 'linea', class: className }: Props = $props();

	const plan = $derived(planVigente(cuenta));
	const avisar = $derived(vencePronto(cuenta));
	const dias = $derived(diasParaVencer(cuenta));

	/** Lo que sigue al nombre del plan */
	const detalle = $derived.by(() => {
		if (plan !== Plan.PRO) return null;
		if (avisar && dias !== null) return `vence ${textoDiasRestantes(dias)}`;
		if (cuenta.plan_vence_at) return `hasta el ${formatVencimiento(cuenta.plan_vence_at)}`;
		return 'sin vencimiento';
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
		<span class={plan === Plan.PRO ? 'font-medium' : 'text-light-two_d dark:text-dark-two_d'}>
			{PLAN_LABEL[plan]}
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
		Plan {PLAN_LABEL[plan]}{detalle ? `, ${detalle}` : ''}
	</span>
{/if}
