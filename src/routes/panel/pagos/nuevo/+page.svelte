<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import RegistrarPagoForm from '#lib/components/features/pagos/registrarPagoForm.svelte';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { FormularioSkeleton } from '#lib/components/skeletons/index.ts';
	import { AlertBox, PageHeader } from '#lib/components/ui/index.ts';
	import type { PagoDetalle } from '#lib/interfaces/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { formatVencimiento } from '#lib/utils/plan.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** Todo lo que se necesita para el formulario, junto */
	const datos = $derived(Promise.all([data.cuenta, data.cuentas, data.planes]));

	async function registrado(pago: PagoDetalle) {
		alert(
			'success',
			`Pago registrado. ${pago.plan.nombre} vigente hasta el ${formatVencimiento(pago.periodo_fin)}.`
		);
		await goto(resolve('/panel/usuarios/[id]', { id: pago.user_id }), { replace: true });
	}
</script>

<MainLayout title="Registrar pago | Panel ME" noIndex>
	<div class="max-w-5xl">
		<PageHeader
			title="Registrar pago"
			description="Renueva el plan de una cuenta. Si su plan sigue vigente, los días se suman al final."
			volver={{ href: resolve('/panel/pagos'), label: 'Pagos' }}
		/>
		<div class="mt-8">
			{#await datos}
				<FormularioSkeleton campos={6} />
			{:then [cuenta, cuentas, planes]}
				<RegistrarPagoForm {cuenta} {cuentas} {planes} onRegistrado={registrado} />
			{:catch error}
				<AlertBox variant="error" title="No se pudo preparar el pago">
					{errorService.getMessage(error)}
				</AlertBox>
			{/await}
		</div>
	</div>
</MainLayout>
