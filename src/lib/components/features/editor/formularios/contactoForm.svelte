<script lang="ts">
	import { untrack } from 'svelte';
	import { AlertBox, Input, SegmentedControl, Switch } from '#lib/components/ui/index.ts';
	import { MailIcon, PhoneIcon, WorldWwwIcon } from '#lib/icons/outline/index.ts';
	import type {
		ContactoTipo,
		TarjetaContacto,
		TarjetaContactoCreateRequest
	} from '#lib/interfaces/index.ts';
	import { tarjetaContactoSchema } from '#lib/zod/tarjetaContacto.schema.ts';
	import { EstadoFormulario } from '../estadoFormulario.svelte.ts';

	interface Props {
		id: string;
		inicial: TarjetaContacto | null;
		guardar: (datos: TarjetaContactoCreateRequest) => Promise<void>;
	}

	let { id, inicial, guardar }: Props = $props();

	const base = untrack(() => inicial);
	let tipo = $state<ContactoTipo>(base?.tipo ?? 'phone');
	let valor = $state(base?.valor ?? '');
	let etiqueta = $state(base?.etiqueta ?? '');
	let isWpp = $state(base?.is_wpp ?? true);
	let isPrimary = $state(base?.is_primary ?? false);
	const estado = new EstadoFormulario();

	const campo = $derived(
		{
			phone: {
				label: 'Número',
				type: 'tel',
				placeholder: '+591 7xx xx xxx',
				icono: PhoneIcon,
				autocomplete: 'tel'
			},
			email: {
				label: 'Correo',
				type: 'email',
				placeholder: 'nombre@dominio.com',
				icono: MailIcon,
				autocomplete: 'email'
			},
			website: {
				label: 'Sitio web',
				type: 'url',
				placeholder: 'www.misitio.com',
				icono: WorldWwwIcon,
				autocomplete: 'url'
			}
		}[tipo]
	);

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		estado.enviar(
			tarjetaContactoSchema,
			{ tipo, valor, etiqueta, is_wpp: tipo === 'phone' && isWpp, is_primary: isPrimary },
			guardar
		);
	}
</script>

<form {id} onsubmit={enviar} novalidate class="space-y-5">
	{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}
	<SegmentedControl
		label="Tipo"
		bind:value={tipo}
		options={[
			{ value: 'phone', label: 'Teléfono', icon: PhoneIcon },
			{ value: 'email', label: 'Correo', icon: MailIcon },
			{ value: 'website', label: 'Sitio web', icon: WorldWwwIcon }
		]}
	/>
	<Input
		label={campo.label}
		type={campo.type}
		icon={campo.icono}
		placeholder={campo.placeholder}
		autocomplete={campo.autocomplete as never}
		required
		bind:value={valor}
		error={estado.errores.valor}
	/>
	<Input
		label="Etiqueta"
		placeholder={tipo === 'phone'
			? 'Celular, Consultorio…'
			: tipo === 'email'
				? 'Citas, Facturación…'
				: 'Portafolio, Tienda…'}
		hint="Se muestra sobre el dato. Opcional."
		maxlength={60}
		bind:value={etiqueta}
		error={estado.errores.etiqueta}
	/>
	{#if tipo === 'phone'}
		<Switch
			label="Tiene WhatsApp"
			descripcion="Muestra el botón de WhatsApp junto al número."
			bind:checked={isWpp}
		/>
	{/if}
	<Switch
		label="Es el principal"
		descripcion="Va primero en el contacto que se guarda, en los accesos rápidos y en el botón flotante."
		bind:checked={isPrimary}
	/>
</form>
