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
	import { CONTACTO_TIPO_LABEL, ROLE_LABEL } from '#lib/constants/index.ts';
	import { LinkIcon, MailIcon, PlusIcon, XIcon } from '#lib/icons/outline/index.ts';
	import type { ContactoTipo, TarjetaContactoCreateRequest } from '#lib/interfaces/index.ts';
	import { usuarioService } from '#lib/services/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { detectarRedSocial, usuarioDesdeUrl, websiteUrl } from '#lib/utils/contacto.ts';
	import { usuarioCreateSchema } from '#lib/zod/usuario.schema.ts';

	let email = $state('');
	let password = $state(generarPassword());
	let rol = $state<AssignableUserRole>(Role.OWNER);
	let activa = $state(true);
	let conTarjeta = $state(true);

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

	const armaTarjeta = $derived(conTarjeta && rol === Role.OWNER);

	/** El primero de cada tipo queda como principal */
	function contactosAEnviar(): TarjetaContactoCreateRequest[] {
		const llenos = contactos.filter((contacto) => contacto.valor.trim());
		return llenos.map((contacto, indice) => ({
			...contacto,
			is_wpp: contacto.tipo === 'phone' && contacto.is_wpp,
			is_primary: llenos.findIndex((otro) => otro.tipo === contacto.tipo) === indice
		}));
	}

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		const cuerpo = {
			email,
			password,
			rol,
			is_active: activa,
			...(armaTarjeta && {
				tarjeta: {
					prefijo,
					nombres,
					apellidos,
					cargo,
					rubro,
					slug,
					contactos: contactosAEnviar(),
					sociales: redes
						.filter((url) => url.trim())
						.map((url) => ({
							red: detectarRedSocial(url) ?? 'otro',
							url: websiteUrl(url.trim()),
							username: usuarioDesdeUrl(url)
						}))
				}
			})
		};
		// Una sola petición: la cuenta, su tarjeta, sus contactos y sus redes
		estado.enviar(usuarioCreateSchema, cuerpo, async (validos) => {
			const respuesta = await usuarioService.crear(validos);
			alert('success', respuesta.tarjeta ? 'Cuenta y tarjeta creadas' : 'Cuenta creada');
			await goto(
				respuesta.tarjeta
					? resolve('/panel/tarjetas/[id]', { id: respuesta.tarjeta.id })
					: resolve('/panel/usuarios'),
				{ replace: true }
			);
		});
	}

	const error = (campo: string) => estado.errores[campo];
</script>

<MainLayout title="Nueva cuenta | Panel ME" noIndex>
	<div class="max-w-3xl">
		<PageHeader
			title="Nueva cuenta"
			description="Crea el acceso al panel y, si es un propietario, su tarjeta en el mismo paso."
			volver={{ href: resolve('/panel/usuarios'), label: 'Usuarios' }}
		/>

		<form onsubmit={enviar} novalidate class="mt-8 space-y-10">
			{#if estado.error}<AlertBox variant="error">{estado.error}</AlertBox>{/if}

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
				<SegmentedControl
					label="Rol"
					bind:value={rol}
					options={[
						{ value: Role.OWNER, label: ROLE_LABEL.OWNER },
						{ value: Role.SUPERADMIN, label: ROLE_LABEL.SUPERADMIN }
					]}
				/>
				<Switch label="Cuenta activa" bind:checked={activa} />
			</section>

			{#if rol === Role.OWNER}
				<section
					aria-labelledby="tarjeta-titulo"
					class="space-y-5 border-t border-light-four/40 pt-8 dark:border-dark-one_d"
				>
					<div class="flex items-start justify-between gap-4">
						<div>
							<h2 id="tarjeta-titulo" class="font-display text-lg font-semibold">Su tarjeta</h2>
							<p class="mt-1 text-sm text-light-two_d dark:text-dark-two_d">
								Nace en borrador; el resto se completa en el editor.
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
										error={error(`tarjeta.sociales.${indice}.url`)}
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
							<Button variant="ghost" size="sm" onclick={() => (redes = [...redes, ''])}>
								{#snippet leftIcon()}<PlusIcon class="size-4" />{/snippet}
								Otra red
							</Button>
						</fieldset>
					{/if}
				</section>
			{/if}

			<div class="flex justify-end border-t border-light-four/40 pt-6 dark:border-dark-one_d">
				<Button type="submit" variant="accent" size="lg" loading={estado.enviando}>
					{armaTarjeta ? 'Crear cuenta y tarjeta' : 'Crear cuenta'}
				</Button>
			</div>
		</form>
	</div>
</MainLayout>
