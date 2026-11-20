<!--
	Plan de una cuenta de propietario y, si es Pro, hasta cuándo. La fecha es un día: vence al final
	de ese día (hora local). Vacía = no vence.
-->
<script lang="ts">
	import { Input, SegmentedControl } from '#lib/components/ui/index.ts';
	import { Plan } from '#lib/config/planes.config.ts';
	import { PLAN_LABEL } from '#lib/constants/data.ts';
	import { todayISO } from '#lib/utils/date.ts';

	interface Props {
		plan: Plan;
		/** `AAAA-MM-DD`; vacío = no vence */
		vence: string;
		errores?: Record<string, string>;
	}

	let { plan = $bindable(), vence = $bindable(), errores = {} }: Props = $props();
</script>

<div class="space-y-4">
	<SegmentedControl
		label="Plan"
		bind:value={plan}
		options={[
			{ value: Plan.FREE, label: PLAN_LABEL.free },
			{ value: Plan.PRO, label: PLAN_LABEL.pro }
		]}
	/>
	{#if errores.plan}
		<p class="text-xs font-medium text-light-error dark:text-dark-error">{errores.plan}</p>
	{/if}
	{#if plan === Plan.PRO}
		<Input
			label="Vence el"
			type="date"
			min={todayISO()}
			bind:value={vence}
			error={errores.plan_vence_at}
			hint="Déjalo vacío si no vence. Al vencer, la cuenta vuelve a Free y su tarjeta pasa a borrador."
			class="sm:max-w-64"
		/>
	{:else}
		<p class="text-sm text-light-two_d dark:text-dark-two_d">
			Con Free puede editar toda su tarjeta, pero no publicarla.
		</p>
	{/if}
</div>
