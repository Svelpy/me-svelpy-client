<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { EstadoFormulario } from '#lib/components/features/editor/index.ts';
	import { generarPassword } from '#lib/components/features/usuarios/password.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { TablaSkeleton } from '#lib/components/skeletons/index.ts';
	import {
		AlertBox,
		Badge,
		Button,
		DropdownMenu,
		EmptyState,
		Input,
		ModalConfirm,
		PageHeader,
		Pagination,
		SegmentedControl,
		Sheet,
		Switch
	} from '#lib/components/ui/index.ts';
	import { Role, type AssignableUserRole } from '#lib/config/permissions.config.ts';
	import { ROLE_LABEL } from '#lib/constants/index.ts';
	import {
		CircleCheckIcon,
		DotsVerticalIcon,
		KeyIcon,
		LockIcon,
		PencilIcon,
		SearchIcon,
		TrashIcon,
		UsersIcon
	} from '#lib/icons/outline/index.ts';
	import type { DropdownOption, UsuarioListItem } from '#lib/interfaces/index.ts';
	import { errorService, usuarioService } from '#lib/services/index.ts';
	import { currentUserStore } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { formatRelativeTime } from '#lib/utils/format.ts';
	import { isRole } from '#lib/utils/rbac.utils.ts';
	import { nombreCompleto } from '#lib/utils/tarjeta.ts';
	import { usuarioPasswordSchema, usuarioUpdateSchema } from '#lib/zod/usuario.schema.ts';
	import { queryConFiltros } from '#lib/utils/filtrosUrl.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let busqueda = $state(page.url.searchParams.get('q') ?? '');
	let temporizador: ReturnType<typeof setTimeout> | undefined;

	/** Cambia un filtro en la URL (y vuelve a la página 1 salvo que cambie la página) */
	function filtrar(cambios: Record<string, string | null>) {
		const query = queryConFiltros(page.url.searchParams, cambios);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve('/panel/usuarios')}${query ? `?${query}` : ''}`, {
			reset: false,
			replace: true
		});
	}

	function buscar(valor: string) {
		busqueda = valor;
		clearTimeout(temporizador);
		temporizador = setTimeout(() => filtrar({ q: valor.trim() || null }), 300);
	}

	const miId = $derived($currentUserStore?.user.id);
	const recargar = () => invalidate('app:usuarios');

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

	// Editar cuenta
	let editando = $state<UsuarioListItem | null>(null);
	let email = $state('');
	let rol = $state<AssignableUserRole>(Role.OWNER);
	let activa = $state(true);
	const formEditar = new EstadoFormulario();

	function abrirEditar(usuario: UsuarioListItem) {
		editando = usuario;
		email = usuario.email;
		rol = isRole(usuario.rol) ? usuario.rol : Role.OWNER;
		activa = usuario.is_active;
		formEditar.limpiar();
	}

	function guardarEdicion(event: SubmitEvent) {
		event.preventDefault();
		const usuario = editando;
		if (!usuario) return;
		formEditar.enviar(usuarioUpdateSchema, { email, rol, is_active: activa }, async (validos) => {
			await usuarioService.actualizar(usuario.id, validos);
			editando = null;
			alert('success', 'Cuenta actualizada');
			await recargar();
		});
	}

	// Restablecer contraseña
	let paraPassword = $state<UsuarioListItem | null>(null);
	let nuevaPassword = $state('');
	const formPassword = new EstadoFormulario();

	function abrirPassword(usuario: UsuarioListItem) {
		paraPassword = usuario;
		nuevaPassword = generarPassword();
		formPassword.limpiar();
	}

	function guardarPassword(event: SubmitEvent) {
		event.preventDefault();
		const usuario = paraPassword;
		if (!usuario) return;
		formPassword.enviar(usuarioPasswordSchema, { password: nuevaPassword }, async (validos) => {
			await usuarioService.restablecerPassword(usuario.id, validos);
			paraPassword = null;
			alert('success', 'Contraseña restablecida. Compártela por un canal privado.');
		});
	}

	// Activar es directo; desactivar pide confirmación porque además oculta su tarjeta
	let porDesactivar = $state<UsuarioListItem | null>(null);
	let cambiandoEstado = $state(false);

	async function cambiarEstado(usuario: UsuarioListItem, activar: boolean) {
		cambiandoEstado = true;
		try {
			await usuarioService.actualizar(usuario.id, { is_active: activar });
			porDesactivar = null;
			alert('success', activar ? 'Cuenta activada' : 'Cuenta desactivada');
			await recargar();
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			cambiandoEstado = false;
		}
	}

	let porEliminar = $state<UsuarioListItem | null>(null);
	let eliminando = $state(false);

	async function eliminar() {
		if (!porEliminar) return;
		eliminando = true;
		try {
			await usuarioService.eliminar(porEliminar.id);
			porEliminar = null;
			alert('success', 'Cuenta eliminada');
			await recargar();
		} catch (causa) {
			alert('error', errorService.getMessage(causa));
		} finally {
			eliminando = false;
		}
	}

	function opciones(usuario: UsuarioListItem): DropdownOption[] {
		const propia = usuario.id === miId;
		const lista: DropdownOption[] = [
			{
				id: 'editar',
				label: 'Editar cuenta',
				icon: PencilIcon,
				action: () => abrirEditar(usuario)
			},
			{
				id: 'password',
				label: 'Restablecer contraseña',
				icon: KeyIcon,
				action: () => abrirPassword(usuario)
			}
		];
		// La cuenta propia no se desactiva ni se elimina desde aquí
		if (propia) return lista;
		lista.push(
			usuario.is_active
				? {
						id: 'desactivar',
						label: 'Desactivar cuenta',
						icon: LockIcon,
						action: () => (porDesactivar = usuario)
					}
				: {
						id: 'activar',
						label: 'Activar cuenta',
						icon: CircleCheckIcon,
						action: () => cambiarEstado(usuario, true)
					},
			{
				id: 'eliminar',
				label: 'Eliminar cuenta',
				icon: TrashIcon,
				action: () => (porEliminar = usuario),
				divider: true
			}
		);
		return lista;
	}
</script>

{#snippet cuenta(usuario: UsuarioListItem)}
	{usuario.email}
	{#if usuario.id === miId}<span
			class="ml-1 text-xs font-normal text-light-two_d dark:text-dark-two_d"
		>
			(tú)
		</span>{/if}
{/snippet}

{#snippet rolDe(usuario: UsuarioListItem)}
	<Badge variant={usuario.rol === Role.SUPERADMIN ? 'default' : 'secondary'}>
		{isRole(usuario.rol) ? ROLE_LABEL[usuario.rol] : usuario.rol}
	</Badge>
{/snippet}

{#snippet tarjetaDe(usuario: UsuarioListItem)}
	{#if usuario.tarjeta}
		<a
			href={resolve('/panel/tarjetas/[id]', { id: usuario.tarjeta.id })}
			class="font-medium underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:decoration-dark-four"
		>
			{nombreCompleto(usuario.tarjeta)}
		</a>
	{:else if usuario.rol === Role.OWNER}
		<a
			href="{resolve('/panel/tarjetas/nueva')}?cuenta={usuario.id}"
			class="text-light-two_d underline decoration-light-four underline-offset-4 hover:text-light-two dark:text-dark-two_d"
		>
			Crear su tarjeta
		</a>
	{:else}
		<span class="text-light-four_d dark:text-dark-four_d">Sin tarjeta</span>
	{/if}
{/snippet}

<!-- Lo normal (activa) va callado; lo que pide atención (desactivada) lleva punto y peso -->
{#snippet estadoDe(usuario: UsuarioListItem)}
	{#if usuario.is_active}
		<span class="text-light-two_d dark:text-dark-two_d">Activa</span>
	{:else}
		<span class="inline-flex items-center gap-1.5 font-medium text-light-two dark:text-dark-two">
			<span class="size-1.5 rounded-full bg-light-warning dark:bg-dark-warning" aria-hidden="true"
			></span>
			Desactivada
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
	<PageHeader
		title="Usuarios"
		description="Las cuentas que entran al panel: propietarios de tarjeta y superadministradores."
	>
		{#snippet actions()}
			<Button href={resolve('/panel/usuarios/nuevo')} variant="accent">Nueva cuenta</Button>
		{/snippet}
	</PageHeader>

	<div class="mt-8 flex flex-col gap-3 lg:flex-row lg:items-end">
		<Input
			type="search"
			label="Buscar"
			placeholder="Correo, nombre o dirección de su tarjeta"
			icon={SearchIcon}
			value={busqueda}
			oninput={(event) => buscar(event.currentTarget.value)}
			class="lg:w-96"
		/>
		<SegmentedControl
			label="Rol"
			options={[
				{ value: 'todos', label: 'Todos' },
				{ value: Role.OWNER, label: 'Propietarios' },
				{ value: Role.SUPERADMIN, label: 'Superadmins' }
			]}
			value={data.filtros.rol ?? 'todos'}
			onchange={(valor) => filtrar({ rol: valor === 'todos' ? null : valor })}
		/>
		<SegmentedControl
			label="Estado"
			options={[
				{ value: 'todos', label: 'Todas' },
				{ value: 'activo', label: 'Activas' },
				{ value: 'inactivo', label: 'Desactivadas' }
			]}
			value={data.filtros.estado ?? 'todos'}
			onchange={(valor) => filtrar({ estado: valor === 'todos' ? null : valor })}
		/>
	</div>

	<div class="mt-7">
		{#await data.listado}
			<TablaSkeleton columnas={5} etiqueta="Cargando las cuentas" />
		{:then listado}
			{#if listado.data.length === 0}
				<EmptyState
					icono={UsersIcon}
					titulo="Ninguna cuenta coincide"
					descripcion="Prueba con otro correo o quita los filtros."
				/>
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
								<th scope="col" class="px-4 py-3">Tarjeta</th>
								<th scope="col" class="px-4 py-3">Estado</th>
								<th scope="col" class="hidden px-4 py-3 lg:table-cell">Último acceso</th>
								<th scope="col" class="px-4 py-3"><span class="sr-only">Acciones</span></th>
							</tr>
						</thead>
						<tbody>
							{#each listado.data as usuario (usuario.id)}
								<tr class="border-t border-light-four/35 dark:border-dark-one_d">
									<td class="max-w-64 truncate px-4 py-3 font-medium">{@render cuenta(usuario)}</td>
									<td class="px-4 py-3">{@render rolDe(usuario)}</td>
									<td class="px-4 py-3">{@render tarjetaDe(usuario)}</td>
									<td class="px-4 py-3">{@render estadoDe(usuario)}</td>
									<td class="hidden px-4 py-3 text-light-two_d lg:table-cell dark:text-dark-two_d">
										{usuario.last_login_at ? formatRelativeTime(usuario.last_login_at) : 'Nunca'}
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
								<p class="truncate">{@render tarjetaDe(usuario)}</p>
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
			</AlertBox>
		{/await}
	</div>
</MainLayout>

<DropdownMenu
	bind:isOpen={menuAbierto}
	options={menuDe ? opciones(menuDe) : []}
	width={232}
	triggerElement={ancla}
	label="Acciones para {menuDe?.email ?? 'la cuenta'}"
/>

<Sheet
	open={editando !== null}
	title="Editar cuenta"
	description={editando?.email}
	onClose={() => (editando = null)}
	dismissible={!formEditar.enviando}
>
	<form id="form-editar-cuenta" onsubmit={guardarEdicion} novalidate class="space-y-5">
		{#if formEditar.error}<AlertBox variant="error">{formEditar.error}</AlertBox>{/if}
		<Input
			label="Correo"
			type="email"
			required
			bind:value={email}
			error={formEditar.errores.email}
		/>
		<SegmentedControl
			label="Rol"
			bind:value={rol}
			options={[
				{ value: Role.OWNER, label: ROLE_LABEL.OWNER },
				{ value: Role.SUPERADMIN, label: ROLE_LABEL.SUPERADMIN }
			]}
		/>
		{#if formEditar.errores.rol}<p
				class="text-xs font-medium text-light-error dark:text-dark-error"
			>
				{formEditar.errores.rol}
			</p>{/if}
		<Switch
			label="Cuenta activa"
			descripcion="Desactivada no puede entrar y su tarjeta deja de verse."
			bind:checked={activa}
		/>
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

<Sheet
	open={paraPassword !== null}
	title="Restablecer contraseña"
	description="Cierra las sesiones abiertas de {paraPassword?.email ?? 'la cuenta'}."
	onClose={() => (paraPassword = null)}
	dismissible={!formPassword.enviando}
>
	<form id="form-password" onsubmit={guardarPassword} novalidate class="space-y-4">
		{#if formPassword.error}<AlertBox variant="error">{formPassword.error}</AlertBox>{/if}
		<Input
			label="Contraseña nueva"
			required
			bind:value={nuevaPassword}
			error={formPassword.errores.password}
			mono
			hint="Al menos 8 caracteres, con letras y números."
		/>
		<Button variant="ghost" size="sm" onclick={() => (nuevaPassword = generarPassword())}>
			Generar otra
		</Button>
	</form>
	{#snippet footer()}
		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button variant="secondary" onclick={() => (paraPassword = null)}>Cancelar</Button>
			<Button type="submit" form="form-password" loading={formPassword.enviando}>
				Restablecer contraseña
			</Button>
		</div>
	{/snippet}
</Sheet>

<ModalConfirm
	isOpen={porDesactivar !== null}
	title="¿Desactivar la cuenta {porDesactivar?.email ?? ''}?"
	message={porDesactivar?.tarjeta
		? 'No podrá entrar al panel y su tarjeta deja de verse hasta que vuelvas a activarla.'
		: 'No podrá entrar al panel hasta que vuelvas a activarla.'}
	confirmLabel="Desactivar cuenta"
	loading={cambiandoEstado}
	onConfirm={() => porDesactivar && cambiarEstado(porDesactivar, false)}
	onCancel={() => (porDesactivar = null)}
/>

<ModalConfirm
	isOpen={porEliminar !== null}
	title="¿Eliminar la cuenta {porEliminar?.email ?? ''}?"
	message={porEliminar?.tarjeta
		? 'También se elimina su tarjeta: deja de verse de inmediato y su dirección queda reservada.'
		: 'La cuenta deja de poder entrar al panel.'}
	confirmLabel="Eliminar cuenta"
	loading={eliminando}
	onConfirm={eliminar}
	onCancel={() => (porEliminar = null)}
/>
