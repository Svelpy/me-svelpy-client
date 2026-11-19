import type { Component } from 'svelte';

export interface DropdownOption {
	id: string;
	icon?: Component<{ class?: string }>;
	label: string;
	action?: () => void;
	divider?: boolean;
	disabled?: boolean;
}
