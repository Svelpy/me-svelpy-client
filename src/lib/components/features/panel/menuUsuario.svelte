<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Avatar, DropdownMenu } from '#lib/components/ui/index.ts';
	import {
		ChevronDownIcon,
		ExternalLinkIcon,
		IdIcon,
		LogOutIcon,
		UserIcon
	} from '#lib/icons/outline/index.ts';
	import type { DropdownOption } from '#lib/interfaces/index.ts';
	import { authStore, currentRole, currentUserStore } from '#lib/stores/index.ts';
	import { canAccessRoute } from '#lib/utils/rbac.utils.ts';
	import { nombreCompleto } from '#lib/utils/tarjeta.ts';

	let abierto = $state(false);
	let disparador = $state<HTMLButtonElement>();

	const usuario = $derived($currentUserStore?.user);
	const tarjeta = $derived($currentUserStore?.tarjeta ?? null);
	const nombre = $derived(tarjeta ? nombreCompleto(tarjeta) : (usuario?.email ?? ''));

	async function salir() {
		await authStore.logout();
		await goto(resolve('/auth/sign-in'), { replace: true });
	}

	const opciones = $derived.by(() => {
		const lista: DropdownOption[] = [];
		if (canAccessRoute($currentRole, '/panel/mi-tarjeta')) {
			lista.push({
				id: 'mi-tarjeta',
				label: 'Mi tarjeta',
				icon: IdIcon,
				action: () => goto(resolve('/panel/mi-tarjeta'))
			});
		}
		if (tarjeta?.is_public) {
			const slug = tarjeta.slug;
			lista.push({
				id: 'ver',
				label: 'Ver mi tarjeta publicada',
				icon: ExternalLinkIcon,
				action: () => window.open(resolve('/[slug]', { slug }), '_blank', 'noopener')
			});
		}
		if (canAccessRoute($currentRole, '/panel/cuenta')) {
			lista.push({
				id: 'cuenta',
				label: 'Mi cuenta',
				icon: UserIcon,
				action: () => goto(resolve('/panel/cuenta'))
			});
		}
		lista.push({
			id: 'salir',
			label: 'Cerrar sesión',
			icon: LogOutIcon,
			action: salir,
			divider: true
		});
		return lista;
	});
</script>

<button
	bind:this={disparador}
	type="button"
	aria-haspopup="menu"
	aria-expanded={abierto}
	aria-label="Menú de tu cuenta"
	onclick={() => (abierto = !abierto)}
	class="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-light-one_d focus-visible:outline-2 focus-visible:outline-light-three sm:pr-2.5 dark:hover:bg-dark-one_d dark:focus-visible:outline-dark-three"
>
	<Avatar src={tarjeta?.profile_url} {nombre} size="sm" />
	<span
		class="hidden max-w-40 truncate text-sm font-medium text-light-two sm:block dark:text-dark-two"
	>
		{tarjeta?.nombres ?? usuario?.email}
	</span>
	<ChevronDownIcon
		class="hidden size-4 text-light-two_d transition-transform sm:block dark:text-dark-two_d {abierto
			? 'rotate-180'
			: ''}"
	/>
</button>

<DropdownMenu
	bind:isOpen={abierto}
	options={opciones}
	width={248}
	triggerElement={disparador}
	label="Tu cuenta"
/>
