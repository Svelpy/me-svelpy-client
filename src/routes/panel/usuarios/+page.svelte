<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { EstadoPlan } from '#lib/components/features/planes/index.ts';
	import { accionesDeCuenta } from '#lib/components/features/usuarios/acciones.ts';
	import DialogosCuenta from '#lib/components/features/usuarios/dialogosCuenta.svelte';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { TablaSkeleton } from '#lib/components/skeletons/index.ts';
	import {
		AlertBox,
		Badge,
		Button,
		DropdownMenu,
		EmptyState,
		PageHeader,
		Pagination,
		SegmentedControl,
		Select
	} from '#lib/components/ui/index.ts';
	import { Role } from '#lib/config/permissions.config.ts';
	import { ROLE_LABEL } from '#lib/constants/index.ts';
	import {
		CircleCheckIcon,
		DotsVerticalIcon,
		KeyIcon,
		LockIcon,
		PencilIcon,
		TrashIcon,
		UserIcon,
		UsersIcon,
		WalletIcon
	} from '#lib/icons/outline/index.ts';
	import type { DropdownOption, Plan, UsuarioListItem } from '#lib/interfaces/index.ts';
	import { errorService } from '#lib/services/index.ts';
	import { currentRole, currentUserStore, planPorId } from '#lib/stores/index.ts';
	import { formatDate } from '#lib/utils/format.ts';
	import { queryConFiltros } from '#lib/utils/filtrosUrl.ts';
	import { isRole } from '#lib/utils/rbac.utils.ts';
	import { rutaConQuery } from '#lib/utils/resolveRoute.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let dialogos = $state<DialogosCuenta>();

	/** Cambia un filtro en la URL (y vuelve a la página 1 salvo que cambie la página) */
	function filtrar(cambios: Record<string, string | null>) {
		const query = queryConFiltros(page.url.searchParams, cambios);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve('/panel/usuarios')}${query ? `?${query}` : ''}`, {
			reset: false,
			replace: true
		});
	}

	const miId = $derived($currentUserStore?.user.id);
	const recargar = () => invalidate('app:usuarios');
	const conFiltros = $derived(
		!!data.filtros.rol || !!data.filtros.plan_id || data.filtros.is_active !== undefined
	);

	// Menú de acciones por fila: uno solo, que se abre junto al botón que lo pidió (tabla o lista)
	let menuDe = $state<UsuarioListItem | null>(null);
	let menuAbierto = $state(false);
	let ancla = $state<HTMLElement>();

	function abrirMenu(usuario: UsuarioListItem, boton: HTMLElement) {
		const mismo = menuAbierto && menuDe?.id === usuario.id && ancla === boton;
		menuDe = usuario;
		ancla = boton;
		menuAbierto = !mismo;
	}

	const detalle = (usuario: UsuarioListItem) => resolve('/panel/usuarios/[id]', { id: usuario.id });

	function opciones(usuario: UsuarioListItem): DropdownOption[] {
		const puede = accionesDeCuenta($currentRole, usuario, miId);
		const lista: DropdownOption[] = [
			{ id: 'ver', label: 'Ver cuenta', icon: UserIcon, action: () => goto(detalle(usuario)) }
		];
		if (puede.editar) {
			lista.push({
				id: 'editar',
				label: 'Editar cuenta',
				icon: PencilIcon,
				action: () => dialogos?.editar(usuario)
			});
		}
		if (puede.registrarPago) {
			lista.push({
				id: 'pago',
				label: 'Registrar pago',
				icon: WalletIcon,
				action: () => goto(rutaConQuery(resolve('/panel/pagos/nuevo'), { usuario: usuario.id }))
			});
		}
		if (puede.enlacePassword) {
			lista.push({
				id: 'password',
				label: 'Enviar enlace de contraseña',
				icon: KeyIcon,
				action: () => dialogos?.enviarEnlace(usuario)
			});
		}
		if (puede.darDeBaja) {
			lista.push({
				id: 'baja',
				label: 'Dar de baja',
				icon: LockIcon,
				action: () => dialogos?.darDeBaja(usuario)
			});
		}
		if (puede.reactivar) {
			lista.push({
				id: 'reactivar',
				label: 'Reactivar cuenta',
				icon: CircleCheckIcon,
				action: () => dialogos?.reactivar(usuario)
			});
		}
		if (puede.eliminar) {
			lista.push({
				id: 'eliminar',
				label: 'Eliminar cuenta',
				icon: TrashIcon,
				action: () => dialogos?.eliminar(usuario),
				divider: true
			});
		}
		return lista;
	}

	/** El plan con su código (del catálogo); si no está, el que trae el listado */
	const planDe = (usuario: UsuarioListItem, planes: Plan[]) => ({
		...usuario,
		plan: planPorId(planes, usuario.plan_id) ?? usuario.plan
	});
</script>

{#snippet cuenta(usuario: UsuarioListItem)}
	<a
		href={detalle(usuario)}
		class="rounded hover:underline focus-visible:outline-2 focus-visible:outline-light-three"
	>
		{usuario.email}
	</a>
	{#if usuario.id === miId}<span
			class="ml-1 text-xs font-normal text-light-two_d dark:text-dark-two_d"
		>
			(tú)
		</span>{/if}
	{#if !usuario.email_verified_at}
		<span
			class="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-light-two_d dark:text-dark-two_d"
		>
			<span class="size-1.5 rounded-full bg-light-warning dark:bg-dark-warning" aria-hidden="true"
			></span>
			Sin verificar
		</span>
	{/if}
{/snippet}

{#snippet rolDe(usuario: UsuarioListItem)}
	<Badge variant={usuario.rol === Role.USER ? 'secondary' : 'default'}>
		{isRole(usuario.rol) ? ROLE_LABEL[usuario.rol] : usuario.rol}
	</Badge>
{/snippet}

{#snippet planCelda(usuario: UsuarioListItem, planes: Plan[])}
	{#if usuario.rol === Role.USER}
		<EstadoPlan cuenta={planDe(usuario, planes)} variante="celda" />
	{:else}
		<span class="text-light-four_d dark:text-dark-four_d">—</span>
	{/if}
{/snippet}

<!-- Lo normal (activa) va callado; lo que pide atención (de baja) lleva punto y peso -->
{#snippet estadoDe(usuario: UsuarioListItem)}
	{#if usuario.is_active}
		<span class="text-light-two_d dark:text-dark-two_d">Activa</span>
	{:else}
		<span class="inline-flex items-center gap-1.5 font-medium text-light-two dark:text-dark-two">
			<span class="size-1.5 rounded-full bg-light-warning dark:bg-dark-warning" aria-hidden="true"
			></span>
			De baja
		</span>
	{/if}
{/snippet}

{#snippet botonMenu(usuario: UsuarioListItem)}
	<button
		type="button"
		aria-label="Acciones para {usuario.email}"
		aria-haspopup="menu"
		aria-expanded={menuAbierto && menuDe?.id === usuario.id}
		onclick={(event) => abrirMenu(usuario, event.currentTarget)}
		class="grid size-9 shrink-0 place-items-center rounded-lg text-light-two_d hover:bg-light-one_d hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two_d dark:hover:bg-dark-one_d"
	>
		<DotsVerticalIcon class="size-5" />
	</button>
{/snippet}

<MainLayout title="Usuarios | Panel ME" noIndex>
	<PageHeader title="Usuarios">
		{#snippet actions()}
			<Button href={resolve('/panel/usuarios/nuevo')} variant="accent">Nueva cuenta</Button>
		{/snippet}
	</PageHeader>

	{#await data.planes then planes}
		<div class="mt-8 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
			<SegmentedControl
				label="Rol"
				options={[
					{ value: 'todos', label: 'Todos' },
					{ value: Role.USER, label: 'Usuarios' },
					{ value: Role.ADMIN, label: 'Administradores' },
					{ value: Role.SUPERADMIN, label: 'Superadmins' }
				]}
				value={data.filtros.rol ?? 'todos'}
				onchange={(valor) => filtrar({ rol: valor === 'todos' ? null : valor })}
			/>
			{#if planes.length > 0}
				<Select
					label="Plan"
					value={data.filtros.plan_id ?? ''}
					onchange={(event) => filtrar({ plan: event.currentTarget.value || null })}
					class="lg:w-48"
				>
					<option value="">Todos</option>
					{#each planes as plan (plan.id)}<option value={plan.id}>{plan.nombre}</option>{/each}
				</Select>
			{/if}
			<SegmentedControl
				label="Estado"
				options={[
					{ value: 'todas', label: 'Todas' },
					{ value: 'activa', label: 'Activas' },
					{ value: 'baja', label: 'De baja' }
				]}
				value={data.estado ?? 'todas'}
				onchange={(valor) => filtrar({ estado: valor === 'todas' ? null : valor })}
			/>
		</div>

		<div class="mt-7">
			{#await data.listado}
				<TablaSkeleton columnas={6} etiqueta="Cargando las cuentas" />
			{:then listado}
				{#if listado.data.length === 0}
					<EmptyState
						icono={UsersIcon}
						titulo={conFiltros ? 'Ninguna cuenta coincide' : 'Todavía no hay cuentas'}
						descripcion={conFiltros
							? 'Prueba con otros filtros o quítalos.'
							: 'Las cuentas se crean al registrarse o desde aquí.'}
					>
						{#snippet acciones()}
							{#if conFiltros}
								<Button
									variant="secondary"
									onclick={() => filtrar({ rol: null, plan: null, estado: null })}
								>
									Quitar filtros
								</Button>
							{/if}
						{/snippet}
					</EmptyState>
				{:else}
					<!-- Escritorio: tabla -->
					<div
						class="hidden overflow-hidden rounded-2xl border border-light-four/40 md:block dark:border-dark-one_d"
					>
						<table class="w-full text-sm">
							<thead
								class="bg-light-one_d/60 text-left text-xs font-semibold text-light-two_d dark:bg-dark-one_d/40 dark:text-dark-two_d"
							>
								<tr>
									<th scope="col" class="px-4 py-3">Cuenta</th>
									<th scope="col" class="px-4 py-3">Rol</th>
									<th scope="col" class="px-4 py-3">Plan</th>
									<th scope="col" class="px-4 py-3">Estado</th>
									<th scope="col" class="hidden px-4 py-3 lg:table-cell">Alta</th>
									<th scope="col" class="px-4 py-3"><span class="sr-only">Acciones</span></th>
								</tr>
							</thead>
							<tbody>
								{#each listado.data as usuario (usuario.id)}
									<tr class="border-t border-light-four/35 dark:border-dark-one_d">
										<td class="max-w-72 truncate px-4 py-3 font-medium">
											{@render cuenta(usuario)}
										</td>
										<td class="px-4 py-3">{@render rolDe(usuario)}</td>
										<td class="px-4 py-3">{@render planCelda(usuario, planes)}</td>
										<td class="px-4 py-3">{@render estadoDe(usuario)}</td>
										<td
											class="hidden px-4 py-3 text-light-two_d tabular-nums lg:table-cell dark:text-dark-two_d"
										>
											{formatDate(usuario.created_at)}
										</td>
										<td class="px-2 py-3 text-right">{@render botonMenu(usuario)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Celular: una fila por cuenta, con el menú siempre a mano -->
					<ul
						class="divide-y divide-light-four/35 rounded-2xl border border-light-four/40 md:hidden dark:divide-dark-one_d dark:border-dark-one_d"
					>
						{#each listado.data as usuario (usuario.id)}
							<li class="flex items-start gap-2 py-3 pr-2 pl-4">
								<div class="min-w-0 flex-1 space-y-1.5 text-sm">
									<p class="truncate font-medium">{@render cuenta(usuario)}</p>
									<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
										{@render rolDe(usuario)}
										{@render estadoDe(usuario)}
									</div>
									{#if usuario.rol === Role.USER}
										<EstadoPlan cuenta={planDe(usuario, planes)} class="text-xs" />
									{/if}
								</div>
								{@render botonMenu(usuario)}
							</li>
						{/each}
					</ul>
					<div class="mt-6">
						<Pagination
							currentPage={listado.page}
							totalPages={listado.total_pages}
							perPage={listado.per_page}
							total={listado.total}
							nombre={listado.total === 1 ? 'cuenta' : 'cuentas'}
							onPageChange={(numero) => filtrar({ page: String(numero) })}
						/>
					</div>
				{/if}
			{:catch error}
				<AlertBox variant="error" title="No se pudieron cargar las cuentas">
					{errorService.getMessage(error)}
					{#snippet accion()}
						<Button size="sm" variant="secondary" onclick={recargar}>Reintentar</Button>
					{/snippet}
				</AlertBox>
			{/await}
		</div>
	{/await}
</MainLayout>

<DropdownMenu
	bind:isOpen={menuAbierto}
	options={menuDe ? opciones(menuDe) : []}
	width={248}
	triggerElement={ancla}
	label="Acciones para {menuDe?.email ?? 'la cuenta'}"
/>

<DialogosCuenta bind:this={dialogos} onCambio={recargar} />
