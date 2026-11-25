<!--
	Los diálogos de las acciones sobre una cuenta (editar, enlace de contraseña, dar de baja,
	reactivar, eliminar). Los usan el listado de usuarios y el detalle de una cuenta: cada uno los
	abre con las funciones exportadas (`bind:this`).
-->
<script lang="ts">
	import { EstadoFormulario } from '#lib/components/features/editor/estadoFormulario.svelte.ts';
	import {
		AlertBox,
		Button,
		Input,
		ModalConfirm,
		SegmentedControl,
		Sheet
	} from '#lib/components/ui/index.ts';
	import { Role, type AssignableUserRole } from '#lib/config/permissions.config.ts';
	import { ROLE_LABEL } from '#lib/constants/index.ts';
	import type { Usuario, UsuarioDetalle } from '#lib/interfaces/index.ts';
	import { AppError, authService, errorService, usuarioService } from '#lib/services/index.ts';
	import { currentRole } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { getAssignableUserRoles, isRole } from '#lib/utils/rbac.utils.ts';
	import { usuarioUpdateSchema } from '#lib/zod/usuario.schema.ts';

	type Cuenta = Pick<Usuario, 'id' | 'email' | 'rol' | 'is_active'>;

	interface Props {
		/** Tras cada cambio (el listado o el detalle vuelven a cargar) */
		onCambio?: (cuenta?: UsuarioDetalle) => void;
		/** Tras eliminar la cuenta */
		onEliminada?: () => void;
	}

	let { onCambio, onEliminada }: Props = $props();

	const rolesAsignables = $derived(getAssignableUserRoles($currentRole));

	// Editar
	let editando = $state<Cuenta | null>(null);
	let email = $state('');
	let rol = $state<AssignableUserRole>(Role.USER);
	const formEditar = new EstadoFormulario();

	export function editar(cuenta: Cuenta) {
		editando = cuenta;
		email = cuenta.email;
		rol = isRole(cuenta.rol) && cuenta.rol !== Role.SUPERADMIN ? cuenta.rol : Role.USER;
		formEditar.limpiar();
	}

	function guardarEdicion(event: SubmitEvent) {
		event.preventDefault();
		const cuenta = editando;
		if (!cuenta) return;
		// Solo lo que cambió
		const cuerpo = {
			...(email.trim().toLowerCase() !== cuenta.email && { email }),
			...(rol !== cuenta.rol && { rol })
		};
		formEditar.enviar(usuarioUpdateSchema, cuerpo, async (validos) => {
			if (Object.keys(validos).length === 0) {
				editando = null;
				return;
			}
			const actualizada = await usuarioService.actualizar(cuenta.id, validos);
			editando = null;
			alert(
				'success',
				validos.email
					? 'Cuenta actualizada. Su correo nuevo queda sin verificar.'
					: 'Cuenta actualizada'
			);
			onCambio?.(actualizada);
		});
	}

	// Enlace para crear una contraseña nueva (la API no deja que un admin la elija)
	let paraEnlace = $state<Cuenta | null>(null);
	let enviandoEnlace = $state(false);

	export function enviarEnlace(cuenta: Cuenta) {
		paraEnlace = cuenta;
	}

	async function confirmarEnlace() {
		const cuenta = paraEnlace;
		if (!cuenta) return;
		enviandoEnlace = true;
		try {
			await authService.olvidePassword(cuenta.email);
			alert('success', `Enlace enviado a ${cuenta.email}`);
			paraEnlace = null;
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			enviandoEnlace = false;
		}
	}

	// Dar de baja (pide confirmación) y reactivar (directo)
	let paraBaja = $state<Cuenta | null>(null);
	/** Por qué se ofrece la baja: al intentar eliminar una cuenta con pagos o tarjeta */
	let motivoBaja = $state('');
	let cambiandoEstado = $state(false);

	export function darDeBaja(cuenta: Cuenta, motivo = '') {
		motivoBaja = motivo;
		paraBaja = cuenta;
	}

	async function confirmarBaja() {
		const cuenta = paraBaja;
		if (!cuenta) return;
		cambiandoEstado = true;
		try {
			const actualizada = await usuarioService.darDeBaja(cuenta.id);
			alert('success', 'Cuenta dada de baja');
			paraBaja = null;
			onCambio?.(actualizada);
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			cambiandoEstado = false;
		}
	}

	export async function reactivar(cuenta: Cuenta) {
		try {
			const actualizada = await usuarioService.reactivar(cuenta.id);
			alert('success', 'Cuenta reactivada. Su tarjeta sigue en borrador hasta que se publique.');
			onCambio?.(actualizada);
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		}
	}

	// Eliminar: si tiene pagos o tarjeta la API responde 409 y se ofrece darla de baja
	let paraEliminar = $state<Cuenta | null>(null);
	let eliminando = $state(false);

	export function eliminar(cuenta: Cuenta) {
		paraEliminar = cuenta;
	}

	async function confirmarEliminar() {
		const cuenta = paraEliminar;
		if (!cuenta) return;
		eliminando = true;
		try {
			await usuarioService.eliminar(cuenta.id);
			alert('success', 'Cuenta eliminada');
			paraEliminar = null;
			// El detalle se va de la página; el listado se vuelve a cargar
			if (onEliminada) onEliminada();
			else onCambio?.();
		} catch (causa) {
			paraEliminar = null;
			if (causa instanceof AppError && causa.status === 409 && cuenta.is_active) {
				darDeBaja(cuenta, errorService.getMessage(causa));
			} else {
				alert('error', errorService.getMessage(causa));
			}
		} finally {
			eliminando = false;
		}
	}
</script>

<Sheet
	open={editando !== null}
	title="Editar cuenta"
	description={editando?.email}
	onClose={() => (editando = null)}
	dismissible={!formEditar.enviando}
>
	<form id="form-editar-cuenta" onsubmit={guardarEdicion} novalidate class="space-y-5">
		{#if formEditar.error && Object.keys(formEditar.errores).length === 0}
			<AlertBox variant="error">{formEditar.error}</AlertBox>
		{/if}
		<Input
			label="Correo"
			type="email"
			required
			hint="Si lo cambias, queda sin verificar hasta que use el enlace que le enviaremos."
			bind:value={email}
			error={formEditar.errores.email}
		/>
		{#if rolesAsignables.length > 1}
			<SegmentedControl
				label="Rol"
				bind:value={rol}
				options={rolesAsignables.map((valor) => ({ value: valor, label: ROLE_LABEL[valor] }))}
			/>
			{#if formEditar.errores.rol}
				<p class="text-xs font-medium text-light-error dark:text-dark-error">
					{formEditar.errores.rol}
				</p>
			{/if}
		{/if}
		<p class="text-sm text-light-two_d dark:text-dark-two_d">
			El plan se renueva registrando un pago; la contraseña, con el enlace que recibe por correo.
		</p>
	</form>
	{#snippet footer()}
		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button variant="secondary" onclick={() => (editando = null)}>Cancelar</Button>
			<Button type="submit" form="form-editar-cuenta" loading={formEditar.enviando}>
				Guardar cambios
			</Button>
		</div>
	{/snippet}
</Sheet>

<ModalConfirm
	isOpen={paraEnlace !== null}
	title="¿Enviar un enlace de contraseña a {paraEnlace?.email ?? ''}?"
	message="Le llega un correo para crear una contraseña nueva. Su contraseña actual sigue valiendo hasta que la cambie."
	confirmLabel="Enviar enlace"
	variant="primary"
	loading={enviandoEnlace}
	onConfirm={confirmarEnlace}
	onCancel={() => (paraEnlace = null)}
/>

<ModalConfirm
	isOpen={paraBaja !== null}
	title={motivoBaja
		? `No se puede eliminar ${paraBaja?.email ?? ''}`
		: `¿Dar de baja a ${paraBaja?.email ?? ''}?`}
	message={`${motivoBaja ? `${motivoBaja} ` : ''}${motivoBaja ? 'Puedes darla de baja: ' : ''}No podrá entrar al panel, se cierran sus sesiones y su tarjeta deja de verse. Se puede reactivar después.`}
	confirmLabel="Dar de baja"
	loading={cambiandoEstado}
	onConfirm={confirmarBaja}
	onCancel={() => (paraBaja = null)}
/>

<ModalConfirm
	isOpen={paraEliminar !== null}
	title="¿Eliminar la cuenta {paraEliminar?.email ?? ''}?"
	message="Se borra para siempre. Si tiene pagos o una tarjeta no se puede eliminar; en ese caso se ofrece darla de baja."
	confirmLabel="Eliminar cuenta"
	loading={eliminando}
	onConfirm={confirmarEliminar}
	onCancel={() => (paraEliminar = null)}
/>
