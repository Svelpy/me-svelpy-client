<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Button, Select } from '#lib/components/ui/index.ts';
	import type { TarjetaCompleta, UsuarioListItem } from '#lib/interfaces/index.ts';
	import { tarjetaService } from '#lib/services/index.ts';
	import { tarjetaCreateSchema, tarjetaNuevaSchema } from '#lib/zod/tarjeta.schema.ts';
	import CamposTarjeta from './camposTarjeta.svelte';
	import { EstadoFormulario } from './estadoFormulario.svelte.ts';

	interface Props {
		/** owner: crea la suya; admin: para una cuenta sin tarjeta */
		modo: 'owner' | 'admin';
		/** Cuentas de propietario sin tarjeta (modo admin) */
		cuentas?: UsuarioListItem[];
		cuentaInicial?: string;
		onCreada: (tarjeta: TarjetaCompleta) => void;
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

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		const datos = { prefijo, nombres, apellidos, cargo, rubro, slug };
		if (modo === 'admin') {
			estado.enviar(tarjetaCreateSchema, { ...datos, user_id: userId }, async (validos) => {
				onCreada(await tarjetaService.crear(validos));
			});
		} else {
			estado.enviar(tarjetaNuevaSchema, datos, async (validos) => {
				onCreada(await tarjetaService.crearMia(validos));
			});
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
			hint="Solo cuentas de propietario que aún no tienen tarjeta."
		>
			<option value="" disabled>Elige una cuenta</option>
			{#each cuentas as cuenta (cuenta.id)}<option value={cuenta.id}>{cuenta.email}</option>{/each}
		</Select>
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
		<Button type="submit" variant="accent" size="lg" loading={estado.enviando}>
			Crear tarjeta
		</Button>
	</div>
</form>
