<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CamposTarjeta, EstadoFormulario } from '#lib/components/features/editor/index.ts';
	import { generarPassword } from '#lib/components/features/usuarios/password.ts';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import {
		AlertBox,
		Button,
		Input,
		PageHeader,
		SegmentedControl,
		Select,
		Switch
	} from '#lib/components/ui/index.ts';
	import { Role, type AssignableUserRole } from '#lib/config/permissions.config.ts';
	import { CONTACTO_TIPO_LABEL, LIMITES_TARJETA, ROLE_LABEL } from '#lib/constants/index.ts';
	import { LinkIcon, MailIcon, PlusIcon, XIcon } from '#lib/icons/outline/index.ts';
	import type {
		ContactoTipo,
		TarjetaContactoInput,
		UsuarioDetalle
	} from '#lib/interfaces/index.ts';
	import { AppError, tarjetaService, usuarioService } from '#lib/services/index.ts';
	import { currentRole } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { detectarRedSocial, usuarioDesdeUrl, websiteUrl } from '#lib/utils/contacto.ts';
	import { getAssignableUserRoles } from '#lib/utils/rbac.utils.ts';
	import { aplicarTipografiaDeRubro, temaDeRubro } from '#lib/utils/temaInicial.ts';
	import { tarjetaNuevaSchema } from '#lib/zod/tarjeta.schema.ts';
	import { usuarioCreateSchema } from '#lib/zod/usuario.schema.ts';

	/** Toda el alta se valida antes de enviar nada: así no queda una cuenta a medias por un typo */
	const altaSchema = usuarioCreateSchema.extend({ tarjeta: tarjetaNuevaSchema.optional() });

	// Solo roles de rango menor: el superadmin crea admins y users; el admin, users
	const rolesAsignables = $derived(getAssignableUserRoles($currentRole));

	let email = $state('');
	let password = $state(generarPassword());
	let rol = $state<AssignableUserRole>(Role.USER);
	let conTarjeta = $state(true);
	/** Si la tarjeta falla, la cuenta ya existe: el siguiente intento solo crea la tarjeta */
	let cuentaCreada = $state<UsuarioDetalle | null>(null);

	let prefijo = $state('');
	let nombres = $state('');
	let apellidos = $state('');
	let cargo = $state('');
	let rubro = $state('');
	let slug = $state('');
	let contactos = $state<
		{ tipo: ContactoTipo; valor: string; etiqueta: string; is_wpp: boolean }[]
	>([
		{ tipo: 'phone', valor: '', etiqueta: '', is_wpp: true },
		{ tipo: 'email', valor: '', etiqueta: '', is_wpp: false }
	]);
	let redes = $state<string[]>(['']);
	const estado = new EstadoFormulario();

	const armaTarjeta = $derived(conTarjeta && rol === Role.USER);

	/** El primero de cada tipo queda como principal */
	function contactosAEnviar(): TarjetaContactoInput[] {
		const llenos = contactos.filter((contacto) => contacto.valor.trim());
		return llenos.map((contacto, indice) => ({
			...contacto,
			is_wpp: contacto.tipo === 'phone' && contacto.is_wpp,
			is_primary: llenos.findIndex((otro) => otro.tipo === contacto.tipo) === indice
		}));
	}

	/** Los errores de la tarjeta (`slug`, `contactos.0.valor`) bajo `tarjeta.` para sus campos */
	function errorDeTarjeta(causa: unknown): unknown {
		if (!(causa instanceof AppError)) return causa;
		const details = Object.fromEntries(
			Object.entries(causa.details).map(([campo, valor]) => [`tarjeta.${campo}`, valor])
		);
		return new AppError({
			message: causa.message,
			code: causa.code,
			status: causa.status,
			details,
			cause: causa
		});
	}

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		const cuerpo = {
			email,
			password,
			rol,
			...(armaTarjeta && {
				tarjeta: {
					prefijo,
					nombres,
					apellidos,
					cargo,
					rubro,
					slug,
					theme: temaDeRubro(rubro),
					contactos: contactosAEnviar(),
					redes: redes
						.filter((url) => url.trim())
						.map((url) => ({
							red: detectarRedSocial(url) ?? 'otro',
							url: websiteUrl(url.trim()),
							username: usuarioDesdeUrl(url)
						}))
				}
			})
		};
		estado.enviar(altaSchema, cuerpo, async ({ tarjeta, ...acceso }) => {
			const cuenta = cuentaCreada ?? (await usuarioService.crear(acceso));
			if (!tarjeta) {
				alert('success', 'Cuenta creada');
				await goto(resolve('/panel/usuarios/[id]', { id: cuenta.id }), { replace: true });
				return;
			}
			cuentaCreada = cuenta;
			let creada;
			try {
				creada = await tarjetaService.crear({ ...tarjeta, user_id: cuenta.id });
			} catch (causa) {
				throw errorDeTarjeta(causa);
			}
			await aplicarTipografiaDeRubro(creada.id, creada.rubro);
			alert('success', 'Cuenta y tarjeta creadas');
			await goto(resolve('/panel/tarjetas/[id]', { id: creada.id }), { replace: true });
		});
	}

	const error = (campo: string) => estado.errores[campo];
	const masContactos = $derived(contactos.length < LIMITES_TARJETA.contactos);
	const masRedes = $derived(redes.length < LIMITES_TARJETA.redes);
</script>

<MainLayout title="Nueva cuenta | Panel ME" noIndex>
	<div class="max-w-3xl">
		<PageHeader
			title="Nueva cuenta"
			description="Crea el acceso al panel y, si es para una persona con tarjeta, su tarjeta en el mismo paso."
			volver={{ href: resolve('/panel/usuarios'), label: 'Usuarios' }}
		/>

		<form onsubmit={enviar} novalidate class="mt-8 space-y-10">
			{#if cuentaCreada}
				<AlertBox variant="success" title="La cuenta {cuentaCreada.email} ya quedó creada">
					Falta su tarjeta: corrige lo marcado y vuelve a intentarlo.
				</AlertBox>
			{/if}
			{#if estado.error && Object.keys(estado.errores).length === 0}
				<AlertBox variant="error">{estado.error}</AlertBox>
			{/if}

			<fieldset disabled={!!cuentaCreada} class="space-y-5">
				<section aria-labelledby="cuenta-titulo" class="space-y-5">
					<h2 id="cuenta-titulo" class="font-display text-lg font-semibold">Acceso</h2>
					<Input
						label="Correo"
						type="email"
						icon={MailIcon}
						required
						autocomplete="off"
						bind:value={email}
						error={error('email')}
					/>
					<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
						<Input
							label="Contraseña inicial"
							required
							bind:value={password}
							error={error('password')}
							hint="Compártela por un canal privado."
							class="flex-1"
							mono
						/>
						<Button
							variant="secondary"
							onclick={() => (password = generarPassword())}
							class="sm:mb-[1.375rem]"
						>
							Generar otra
						</Button>
					</div>
					{#if rolesAsignables.length > 1}
						<SegmentedControl
							label="Rol"
							bind:value={rol}
							options={rolesAsignables.map((valor) => ({ value: valor, label: ROLE_LABEL[valor] }))}
						/>
					{/if}
					<p class="text-sm text-light-two_d dark:text-dark-two_d">
						Empieza con el plan Free y el correo sin verificar: le enviaremos el enlace.
						{rol === Role.USER ? 'Para publicar, registra el pago de un plan desde su cuenta.' : ''}
					</p>
				</section>
			</fieldset>

			{#if rol === Role.USER}
				<section
					aria-labelledby="tarjeta-titulo"
					class="space-y-5 border-t border-light-four/40 pt-8 dark:border-dark-one_d"
				>
					<div class="flex items-start justify-between gap-4">
						<div>
							<h2 id="tarjeta-titulo" class="font-display text-lg font-semibold">Su tarjeta</h2>
							<p class="mt-1 text-sm text-light-two_d dark:text-dark-two_d">
								Nace en borrador con el tema que sugiere su rubro; el resto se completa en el
								editor.
							</p>
						</div>
						<Switch label="Crear su tarjeta ahora" etiquetaOculta bind:checked={conTarjeta} />
					</div>

					{#if conTarjeta}
						<CamposTarjeta
							bind:prefijo
							bind:nombres
							bind:apellidos
							bind:cargo
							bind:rubro
							bind:slug
							errores={estado.errores}
							prefijoErrores="tarjeta."
						/>

						<fieldset class="space-y-3">
							<legend class="text-sm font-medium">Contacto</legend>
							{#each contactos as contacto, indice (indice)}
								<div
									class="grid gap-2 rounded-2xl border border-light-four/40 p-3 sm:grid-cols-[9rem_1fr_9rem_auto] sm:items-start dark:border-dark-one_d"
								>
									<Select
										aria-label="Tipo del contacto {indice + 1}"
										size="sm"
										bind:value={contactos[indice].tipo}
									>
										{#each Object.entries(CONTACTO_TIPO_LABEL) as [valor, etiqueta] (valor)}<option
												value={valor}
											>
												{etiqueta}
											</option>{/each}
									</Select>
									<Input
										aria-label="Dato del contacto {indice + 1}"
										size="sm"
										placeholder={contacto.tipo === 'phone'
											? '+591 7xx xx xxx'
											: contacto.tipo === 'email'
												? 'nombre@dominio.com'
												: 'www.sitio.com'}
										bind:value={contactos[indice].valor}
										error={error(`tarjeta.contactos.${indice}.valor`)}
									/>
									<Input
										aria-label="Etiqueta del contacto {indice + 1}"
										size="sm"
										placeholder="Etiqueta"
										bind:value={contactos[indice].etiqueta}
									/>
									<div class="flex items-center gap-2 sm:pt-1">
										{#if contacto.tipo === 'phone'}
											<label class="flex items-center gap-1.5 text-xs whitespace-nowrap">
												<input
													type="checkbox"
													bind:checked={contactos[indice].is_wpp}
													class="rounded border-light-four text-light-three focus:ring-light-three dark:border-dark-four dark:bg-dark-one"
												/>
												WhatsApp
											</label>
										{/if}
										<button
											type="button"
											aria-label="Quitar el contacto {indice + 1}"
											onclick={() => (contactos = contactos.filter((_, i) => i !== indice))}
											class="grid size-8 place-items-center rounded-lg text-light-two_d hover:bg-light-one_d dark:text-dark-two_d dark:hover:bg-dark-one_d"
										>
											<XIcon class="size-4" />
										</button>
									</div>
								</div>
							{/each}
							<Button
								variant="ghost"
								size="sm"
								disabled={!masContactos}
								onclick={() =>
									(contactos = [
										...contactos,
										{ tipo: 'phone', valor: '', etiqueta: '', is_wpp: false }
									])}
							>
								{#snippet leftIcon()}<PlusIcon class="size-4" />{/snippet}
								Otro contacto
							</Button>
						</fieldset>

						<fieldset class="space-y-3">
							<legend class="text-sm font-medium">Redes</legend>
							<p class="text-xs text-light-two_d dark:text-dark-two_d">
								Pega el enlace: la red se reconoce sola.
							</p>
							{#each redes as _, indice (indice)}
								<div class="flex items-start gap-2">
									<Input
										aria-label="Enlace de la red {indice + 1}"
										size="sm"
										icon={LinkIcon}
										placeholder="https://instagram.com/usuario"
										bind:value={redes[indice]}
										error={error(`tarjeta.redes.${indice}.url`)}
										class="flex-1"
									/>
									<button
										type="button"
										aria-label="Quitar la red {indice + 1}"
										onclick={() => (redes = redes.filter((_, i) => i !== indice))}
										class="grid size-9 place-items-center rounded-lg text-light-two_d hover:bg-light-one_d dark:text-dark-two_d dark:hover:bg-dark-one_d"
									>
										<XIcon class="size-4" />
									</button>
								</div>
							{/each}
							<Button
								variant="ghost"
								size="sm"
								disabled={!masRedes}
								onclick={() => (redes = [...redes, ''])}
							>
								{#snippet leftIcon()}<PlusIcon class="size-4" />{/snippet}
								Otra red
							</Button>
						</fieldset>
					{/if}
				</section>
			{/if}

			<div class="flex justify-end border-t border-light-four/40 pt-6 dark:border-dark-one_d">
				<Button type="submit" variant="accent" size="lg" loading={estado.enviando}>
					{cuentaCreada
						? 'Crear su tarjeta'
						: armaTarjeta
							? 'Crear cuenta y tarjeta'
							: 'Crear cuenta'}
				</Button>
			</div>
		</form>
	</div>
</MainLayout>
