<script lang="ts">
	import Button from './button.svelte';

	interface Props {
		isOpen: boolean;
		/** Pregunta concreta: "¿Eliminar el contacto 'Consultorio'?" */
		title?: string;
		/** Qué pasa si se confirma */
		message: string;
		/** El verbo de la acción: "Eliminar", "Desactivar" */
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'danger' | 'primary';
		loading?: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		isOpen,
		title = '¿Confirmas esta acción?',
		message,
		confirmLabel = 'Confirmar',
		cancelLabel = 'Cancelar',
		variant = 'danger',
		loading = false,
		onConfirm,
		onCancel
	}: Props = $props();

	const id = $props.id();
	let dialog = $state<HTMLDialogElement>();

	// <dialog> nativo: foco atrapado y Escape; el foco inicial queda en "Cancelar" (lo seguro)
	$effect(() => {
		if (!dialog) return;
		if (isOpen && !dialog.open) dialog.showModal();
		else if (!isOpen && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	role="alertdialog"
	aria-labelledby="{id}-titulo"
	aria-describedby="{id}-mensaje"
	oncancel={(event) => {
		event.preventDefault();
		if (!loading) onCancel();
	}}
	class="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border-0 bg-light-one p-0 text-light-two shadow-2xl backdrop:bg-light-black/50 backdrop:backdrop-blur-sm dark:bg-dark-one dark:text-dark-two dark:backdrop:bg-dark-black/60"
>
	<div class="p-6">
		<h2 id="{id}-titulo" class="font-display text-lg leading-snug font-semibold">{title}</h2>
		<p id="{id}-mensaje" class="mt-2 text-sm leading-relaxed text-light-two_d dark:text-dark-two_d">
			{message}
		</p>
		<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button variant="secondary" onclick={onCancel} disabled={loading}>{cancelLabel}</Button>
			<Button
				variant={variant === 'danger' ? 'destructive' : 'primary'}
				{loading}
				onclick={onConfirm}
			>
				{confirmLabel}
			</Button>
		</div>
	</div>
</dialog>
