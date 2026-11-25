<!--
	Crear una tarjeta con lo mínimo: el user, la suya (si su cuenta la creó un admin y no tiene);
	un admin, la de una cuenta. Nace en borrador con el tema que sugiere su rubro.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { AlertBox, Button, Select } from '#lib/components/ui/index.ts';
	import type { TarjetaDetalle, UsuarioListItem } from '#lib/interfaces/index.ts';
	import { tarjetaService } from '#lib/services/index.ts';
	import { aplicarTipografiaDeRubro, temaDeRubro } from '#lib/utils/temaInicial.ts';
	import { tarjetaCreateSchema, tarjetaMinimaSchema } from '#lib/zod/tarjeta.schema.ts';
	import CamposTarjeta from './camposTarjeta.svelte';
	import { EstadoFormulario } from './estadoFormulario.svelte.ts';

	interface Props {
		/** user: crea la suya; admin: la de una cuenta */
		modo: 'user' | 'admin';
		/** Cuentas de usuario activas (modo admin) */
		cuentas?: UsuarioListItem[];
		cuentaInicial?: string;
		onCreada: (tarjeta: TarjetaDetalle) => void | Promise<void>;
	}

	let { modo, cuentas = [], cuentaInicial = '', onCreada }: Props = $props();

	// Solo el valor inicial: después lo cambia el selector
	let userId = $state(untrack(() => cuentaInicial));
	let prefijo = $state('');
	let nombres = $state('');
	let apellidos = $state('');
	let cargo = $state('');
	let rubro = $state('');
	let slug = $state('');
	const estado = new EstadoFormulario();

	/** La tarjeta que ya tiene la cuenta elegida (cada cuenta tiene una sola) */
	let existente = $state<{ id: string; slug: string } | null>(null);
	$effect(() => {
		const id = userId;
		existente = null;
		if (modo !== 'admin' || !id) return;
		let vigente = true;
		tarjetaService
			.listar({ user_id: id, per_page: 1 })
			.then(({ data }) => {
				if (vigente && data[0]) existente = { id: data[0].id, slug: data[0].slug };
			})
			.catch(() => {
				// Si no se puede revisar, el backend responde 409 al crear
			});
		return () => {
			vigente = false;
		};
	});

	async function crear(datos: Parameters<typeof tarjetaService.crear>[0]) {
		const tarjeta = await tarjetaService.crear(datos);
		await aplicarTipografiaDeRubro(tarjeta.id, tarjeta.rubro);
		await onCreada(tarjeta);
	}

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		const datos = {
			prefijo,
			nombres,
			apellidos,
			cargo,
			rubro,
			slug,
			theme: temaDeRubro(rubro)
		};
		if (modo === 'admin') {
			estado.enviar(tarjetaCreateSchema, { ...datos, user_id: userId }, crear);
		} else {
			estado.enviar(tarjetaMinimaSchema, datos, crear);
		}
	}
</script>

<form onsubmit={enviar} novalidate class="space-y-6">
	{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
	{#if modo === 'admin'}
		<Select
			label="Cuenta"
			required
			bind:value={userId}
			error={estado.errores.user_id}
			hint="Cuentas de usuario activas. Cada una tiene una sola tarjeta."
		>
			<option value="" disabled>Elige una cuenta</option>
			{#each cuentas as cuenta (cuenta.id)}<option value={cuenta.id}>{cuenta.email}</option>{/each}
		</Select>
		{#if existente}
			<AlertBox variant="info" title="Esta cuenta ya tiene su tarjeta">
				Está en /{existente.slug}.
				{#snippet accion()}
					<Button
						variant="secondary"
						size="sm"
						href={resolve('/panel/tarjetas/[id]', { id: existente!.id })}
					>
						Abrir el editor
					</Button>
				{/snippet}
			</AlertBox>
		{/if}
	{/if}
	<CamposTarjeta
		bind:prefijo
		bind:nombres
		bind:apellidos
		bind:cargo
		bind:rubro
		bind:slug
		errores={estado.errores}
	/>
	<div class="flex justify-end">
		<Button
			type="submit"
			variant="accent"
			size="lg"
			loading={estado.enviando}
			disabled={!!existente}
		>
			Crear tarjeta
		</Button>
	</div>
</form>
