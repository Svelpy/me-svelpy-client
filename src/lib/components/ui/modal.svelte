<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sheet from './sheet.svelte';

	interface Props {
		isOpen: boolean;
		title: string;
		onClose: () => void;
		children: Snippet;
		footer?: Snippet;
		description?: string;
		size?: 'md' | 'lg' | 'xl';
		/** false mientras se guarda: no se cierra con Escape ni el fondo */
		dismissible?: boolean;
	}

	let {
		isOpen,
		title,
		onClose,
		children,
		footer,
		description,
		size = 'lg',
		dismissible = true
	}: Props = $props();
</script>

<!-- Diálogo de formularios: hoja inferior en móvil y centrado en escritorio (ver Sheet) -->
<Sheet open={isOpen} {title} {description} {onClose} {footer} {size} {dismissible}>
	{@render children()}
</Sheet>
