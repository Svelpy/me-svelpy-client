<!--
	Registrar un pago: la cuenta, el plan, cómo pagó y, si hubo oferta, cuánto. Al lado, el recibo
	que se confirma. La clave de idempotencia se crea una vez por formulario: un doble clic o un
	reintento tras un corte de red no registran el pago dos veces.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import CampoImagen from '#lib/components/features/editor/campoImagen.svelte';
	import {
		EstadoFormulario,
		numeroONull
	} from '#lib/components/features/editor/estadoFormulario.svelte.ts';
	import { AlertBox, Button, Input, Select, Switch } from '#lib/components/ui/index.ts';
	import { esPlanFree, PLAN_FREE, PLAN_PRO, planVencido } from '#lib/config/planes.config.ts';
	import { METODO_PAGO_LABEL } from '#lib/constants/data.ts';
	import type {
		MetodoPago,
		PagoDetalle,
		Plan,
		Usuario,
		UsuarioListItem
	} from '#lib/interfaces/index.ts';
	import { pagoService } from '#lib/services/index.ts';
	import { formatearMonto } from '#lib/utils/plan.ts';
	import { numeroDe } from '#lib/utils/tarjeta.ts';
	import { METODOS_PAGO, pagoCreateSchema } from '#lib/zod/pago.schema.ts';
	import { nuevaClaveIdempotencia } from './pagos.ts';
	import ReciboPago from './reciboPago.svelte';

	interface Props {
		/** La cuenta ya elegida (desde su detalle o el editor) */
		cuenta: Usuario | null;
		/** Para elegir, si no vino ninguna */
		cuentas: UsuarioListItem[];
		planes: Plan[];
		onRegistrado: (pago: PagoDetalle) => void;
	}

	let { cuenta, cuentas, planes, onRegistrado }: Props = $props();

	// Free no se cobra: solo los planes pagos
	const planesPagos = $derived(planes.filter((plan) => plan.codigo !== PLAN_FREE));

	let userId = $state(untrack(() => cuenta?.id ?? ''));
	let planId = $state(
		untrack(() => {
			const actual = cuenta ? planes.find((p) => p.id === cuenta.plan_id) : undefined;
			if (actual && actual.codigo !== PLAN_FREE) return actual.id;
			return (
				(planes.find((p) => p.codigo === PLAN_PRO) ?? planes.find((p) => p.codigo !== PLAN_FREE))
					?.id ?? ''
			);
		})
	);
	let metodo = $state<MetodoPago | ''>('');
	let conOferta = $state(false);
	let monto = $state('');
	let referencia = $state('');
	let comprobante = $state<string | null>(null);
	let clave = $state(nuevaClaveIdempotencia());
	const estado = new EstadoFormulario();
	const idFormulario = $props.id();

	const elegida = $derived<Pick<Usuario, 'id' | 'email' | 'plan_id' | 'plan_vence_at'> | null>(
		cuenta ?? cuentas.find((c) => c.id === userId) ?? null
	);
	const plan = $derived(planes.find((p) => p.id === planId) ?? null);
	const precio = $derived(plan ? numeroDe(plan.precio) : null);
	const montoOferta = $derived(conOferta ? numeroONull(monto) : null);

	/** El pago suma desde el vencimiento actual si su plan pago sigue vigente; si no, desde hoy */
	const desde = $derived.by(() => {
		const ahora = new Date();
		if (!elegida) return ahora;
		const planActual = planes.find((p) => p.id === elegida.plan_id);
		const cuentaConPlan = {
			plan: planActual ?? { codigo: PLAN_FREE, nombre: 'Free' },
			plan_vence_at: elegida.plan_vence_at
		};
		return esPlanFree(cuentaConPlan) || planVencido(cuentaConPlan, ahora)
			? ahora
			: new Date(elegida.plan_vence_at);
	});

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		// La oferta no puede pasar del precio del plan (el backend lo vuelve a validar)
		if (conOferta && montoOferta !== null && precio !== null && montoOferta > precio && plan) {
			estado.errores = {
				monto: `No puede superar el precio del plan (${formatearMonto(precio, plan.moneda)}).`
			};
			estado.error = 'Revisa los campos marcados.';
			return;
		}
		estado.enviar(
			pagoCreateSchema,
			{
				user_id: userId,
				plan_id: planId,
				monto: conOferta ? montoOferta : null,
				metodo: metodo || undefined,
				referencia_externa: referencia,
				comprobante_url: comprobante,
				idempotency_key: clave
			},
			async (validos) => {
				const pago = await pagoService.registrar(validos);
				// Registrado: un pago nuevo desde aquí sería otro, con otra clave
				clave = nuevaClaveIdempotencia();
				onRegistrado(pago);
			}
		);
	}
</script>

<div class="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
	<form id={idFormulario} onsubmit={enviar} novalidate class="space-y-6">
		{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}

		{#if cuenta}
			<div>
				<p class="text-sm font-medium">Cuenta</p>
				<p class="mt-1.5 font-medium break-all">{cuenta.email}</p>
			</div>
		{:else}
			<Select
				label="Cuenta"
				required
				bind:value={userId}
				error={estado.errores.user_id}
				hint="Las cuentas de usuario. ¿No está? Ábrela desde Usuarios y registra el pago desde ahí."
			>
				<option value="" disabled>Elige una cuenta</option>
				{#each cuentas as opcion (opcion.id)}<option value={opcion.id}>
						{opcion.email}
					</option>{/each}
			</Select>
		{/if}

		<div class="grid gap-5 sm:grid-cols-2">
			<Select label="Plan" required bind:value={planId} error={estado.errores.plan_id}>
				<option value="" disabled>Elige un plan</option>
				{#each planesPagos as opcion (opcion.id)}
					<option value={opcion.id}>
						{opcion.nombre}, {formatearMonto(opcion.precio, opcion.moneda)}
					</option>
				{/each}
			</Select>
			<Select label="Cómo pagó" required bind:value={metodo} error={estado.errores.metodo}>
				<option value="" disabled>Elige el método</option>
				{#each METODOS_PAGO as opcion (opcion)}
					<option value={opcion}>{METODO_PAGO_LABEL[opcion]}</option>
				{/each}
			</Select>
		</div>

		<div class="space-y-4">
			<Switch
				label="Cobrar otro monto"
				descripcion="Para una oferta o un descuento. Nunca más que el precio del plan."
				bind:checked={conOferta}
			/>
			{#if conOferta}
				<Input
					label="Monto cobrado"
					inputmode="decimal"
					placeholder={precio !== null ? String(precio) : '60'}
					hint={plan ? `En ${plan.moneda}.` : undefined}
					bind:value={monto}
					error={estado.errores.monto}
					class="sm:max-w-xs"
				/>
			{/if}
		</div>

		<Input
			label="Referencia"
			placeholder="Nro. de operación"
			hint="Opcional. Ayuda a encontrar el pago en el banco."
			maxlength={100}
			mono
			bind:value={referencia}
			error={estado.errores.referencia_externa}
		/>

		<CampoImagen
			id="comprobante"
			label="Comprobante"
			tipo="comprobante"
			hint="Opcional. La foto o captura del pago."
			bind:value={comprobante}
			error={estado.errores.comprobante_url}
		/>
	</form>

	<!-- En el celular el recibo va antes del botón: se confirma lo que se ve -->
	<div class="lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1">
		<ReciboPago
			email={elegida?.email ?? null}
			{plan}
			monto={montoOferta}
			metodo={metodo || null}
			{referencia}
			{desde}
		/>
	</div>

	<div
		class="flex justify-end border-t border-light-four/40 pt-6 lg:col-start-1 dark:border-dark-one_d"
	>
		<Button type="submit" form={idFormulario} variant="accent" size="lg" loading={estado.enviando}>
			Registrar pago
		</Button>
	</div>
</div>
