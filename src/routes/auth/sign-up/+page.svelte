<!--
	Registro propio en tres pasos, uno por pantalla: el enlace (lo que se comparte), el acceso y los
	datos de la persona. A la derecha (escritorio) la tarjeta se arma mientras se escribe. Nace con el
	plan Free (edita todo, no publica) y el correo sin verificar; entra directo al editor.
	`?enlace=` llega desde la landing con el enlace ya elegido.
-->
<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		CampoEnlace,
		EstadoFormulario,
		RubroCombobox,
		type EstadoEnlace
	} from '#lib/components/features/editor/index.ts';
	import VistaPreviaRegistro from '#lib/components/features/registro/vistaPreviaRegistro.svelte';
	import { MainLayout } from '#lib/components/layout/index.ts';
	import { AlertBox, Button, Input } from '#lib/components/ui/index.ts';
	import { valoresDeRubro } from '#lib/config/rubros.config.ts';
	import { TEMAS_TARJETA } from '#lib/config/temasTarjeta.config.ts';
	import { tipografiaPorId } from '#lib/config/tipografiasTarjeta.config.ts';
	import { LOGOS_ME, PREFIJOS_SUGERIDOS } from '#lib/constants/index.ts';
	import {
		ArrowLeftIcon,
		EyeIcon,
		EyeOffIcon,
		LockIcon,
		MailIcon
	} from '#lib/icons/outline/index.ts';
	import { tarjetaService } from '#lib/services/index.ts';
	import { authStore } from '#lib/stores/index.ts';
	import { alert } from '#lib/utils/alert.ts';
	import { limpiarSlugEscrito } from '#lib/utils/slug.ts';
	import { aplicarTipografiaDeRubro, temaDeRubro } from '#lib/utils/temaInicial.ts';
	import { validateSchema } from '#lib/utils/validateSchema.ts';
	import { emailSchema, passwordSchema, slugSchema } from '#lib/zod/common.ts';
	import { registroSchema } from '#lib/zod/usuario.schema.ts';
	import { z } from 'zod';

	type Paso = 1 | 2 | 3;
	const TOTAL_PASOS = 3;

	const PASOS: Record<Paso, { titulo: string; texto: string }> = {
		1: {
			titulo: 'Elige tu enlace',
			texto:
				'Es lo que compartirás con tus clientes. Elígelo con calma: después solo lo cambia soporte.'
		},
		2: {
			titulo: 'Crea tu acceso',
			texto: 'Con tu correo y tu contraseña entras a editar tu tarjeta cuando quieras.'
		},
		3: {
			titulo: 'Cuéntanos de ti',
			texto:
				'Es lo primero que verán tus clientes. Fotos, contacto y lo demás lo completas después.'
		}
	};

	let paso = $state<Paso>(1);
	let slug = $state(untrack(() => limpiarSlugEscrito(page.url.searchParams.get('enlace') ?? '')));
	let estadoEnlace = $state<EstadoEnlace>('vacio');
	let revisandoEnlace = $state(false);
	let email = $state('');
	let password = $state('');
	let verPassword = $state(false);
	let prefijo = $state('');
	let nombres = $state('');
	let apellidos = $state('');
	let cargo = $state('');
	let rubro = $state('');
	const estado = new EstadoFormulario();
	const listaPrefijos = $props.id();

	let titulo = $state<HTMLHeadingElement>();
	const sinMovimiento =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/** Cambia de paso y lleva el foco al título nuevo (lo anuncia el lector de pantalla) */
	async function irA(nuevo: Paso) {
		paso = nuevo;
		await tick();
		titulo?.focus();
	}

	const errorDe = (...campos: string[]) =>
		campos.map((campo) => estado.errores[campo]).find(Boolean);

	async function continuarEnlace() {
		estado.limpiar();
		const formato = slugSchema.safeParse(slug.replace(/-+$/, ''));
		if (!formato.success) {
			estado.errores = { slug: formato.error.issues[0]?.message ?? 'Revisa el enlace.' };
			return;
		}
		slug = formato.data;
		if (estadoEnlace === 'ocupado' || estadoEnlace === 'invalido') return;
		if (estadoEnlace !== 'libre') {
			// La revisión en vivo no terminó: se pregunta antes de seguir
			revisandoEnlace = true;
			try {
				const respuesta = await tarjetaService.slugDisponible(slug);
				if (!respuesta.disponible) {
					estado.errores = { slug: 'Ya está en uso. Elige otro.' };
					return;
				}
			} catch {
				// Sin red se sigue: el backend lo vuelve a revisar al crear la cuenta
			} finally {
				revisandoEnlace = false;
			}
		}
		await irA(2);
	}

	async function continuarAcceso() {
		const resultado = validateSchema(z.object({ email: emailSchema, password: passwordSchema }), {
			email,
			password
		});
		if (!resultado.success) {
			estado.errores = resultado.errors;
			estado.error = '';
			return;
		}
		estado.limpiar();
		await irA(3);
	}

	async function crear() {
		const cuerpo = {
			email,
			password,
			tarjeta: { prefijo, nombres, apellidos, cargo, rubro, slug, theme: temaDeRubro(rubro) }
		};
		const creada = await estado.enviar(registroSchema, cuerpo, async (validos) => {
			const sesion = await authStore.registrar(validos);
			// La API crea la tarjeta con la tipografía 1: se aplica la que sugiere el rubro
			if (sesion.tarjeta && (await aplicarTipografiaDeRubro(sesion.tarjeta.id, rubro))) {
				await authStore.refreshUser().catch(() => null);
			}
			alert('success', 'Tu tarjeta está lista para editar');
			await goto(resolve('/panel/mi-tarjeta'), { replace: true });
		});
		if (creada) return;
		// Si el problema está en un paso anterior (correo o enlace en uso), se vuelve a ese paso
		if (errorDe('tarjeta.slug')) await irA(1);
		else if (errorDe('email', 'password')) await irA(2);
	}

	function enviar(event: SubmitEvent) {
		event.preventDefault();
		if (paso === 1) continuarEnlace();
		else if (paso === 2) continuarAcceso();
		else crear();
	}

	const inicio = $derived.by(() => {
		if (!rubro.trim()) return undefined;
		const valores = valoresDeRubro(rubro);
		return `Tu tarjeta empezará con el tema ${TEMAS_TARJETA[valores.preset].nombre} y la tipografía ${tipografiaPorId(valores.tipografia).nombre}.`;
	});

	/** Error general solo si no está ya marcado en un campo del paso */
	const errorGeneral = $derived(
		estado.error && Object.keys(estado.errores).length === 0 ? estado.error : ''
	);
</script>

<MainLayout title="Crea tu tarjeta | ME" noIndex canonicalUrl="/auth/sign-up">
	<div class="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
		<main class="flex min-w-0 flex-col px-5 pt-6 pb-8 sm:px-10">
			<a
				href={resolve('/')}
				class="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-light-three dark:focus-visible:outline-dark-three"
			>
				<img
					src={LOGOS_ME.isotipoClaro}
					alt="ME, ir a la página principal"
					width="54"
					height="32"
					class="h-8 w-auto dark:hidden"
				/>
				<img
					src={LOGOS_ME.isotipoOscuro}
					alt="ME, ir a la página principal"
					width="54"
					height="32"
					class="hidden h-8 w-auto dark:block"
				/>
			</a>

			<div class="mx-auto my-auto w-full max-w-[27rem] py-12">
				<!-- Dónde está: tres tramos, el naranja es lo recorrido -->
				<div class="flex items-center justify-between gap-4">
					<p class="text-sm font-medium text-light-two_d dark:text-dark-two_d">
						Paso {paso} de {TOTAL_PASOS}
					</p>
					{#if paso > 1}
						<button
							type="button"
							onclick={() => {
								estado.limpiar();
								irA((paso - 1) as Paso);
							}}
							class="-mr-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-light-two_d hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three"
						>
							<ArrowLeftIcon class="size-4" />
							Atrás
						</button>
					{/if}
				</div>
				<div class="mt-2.5 grid grid-cols-3 gap-1.5" aria-hidden="true">
					{#each { length: TOTAL_PASOS } as _, indice (indice)}
						<span
							class={[
								'h-1 rounded-full transition-colors duration-300',
								indice < paso
									? 'bg-light-accent dark:bg-dark-accent'
									: 'bg-light-four/40 dark:bg-dark-one_d'
							]}
						></span>
					{/each}
				</div>

				<form onsubmit={enviar} novalidate class="mt-10">
					{#key paso}
						<div in:fly={{ x: 16, duration: sinMovimiento ? 0 : 220 }}>
							<h1
								bind:this={titulo}
								tabindex="-1"
								class="font-display text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.02em] text-balance outline-none sm:text-[2.625rem]"
							>
								{PASOS[paso].titulo}
							</h1>
							<p class="mt-3 text-[0.9375rem] text-pretty text-light-two_d dark:text-dark-two_d">
								{PASOS[paso].texto}
							</p>

							<div class="mt-8 space-y-5">
								{#if errorGeneral}<AlertBox variant="error">{errorGeneral}</AlertBox>{/if}

								{#if paso === 1}
									<CampoEnlace
										bind:value={slug}
										bind:estado={estadoEnlace}
										label="Tu enlace"
										required
										pistas={[apellidos, rubro]}
										size="lg"
										hint="Solo minúsculas, números y guiones. Por ejemplo: dra-fabiola-pediatra."
										error={errorDe('slug', 'tarjeta.slug')}
									/>
								{:else if paso === 2}
									<Input
										label="Correo"
										type="email"
										autocomplete="email"
										inputmode="email"
										icon={MailIcon}
										required
										size="lg"
										placeholder="tu@correo.com"
										bind:value={email}
										error={errorDe('email')}
									/>
									<Input
										label="Contraseña"
										type={verPassword ? 'text' : 'password'}
										autocomplete="new-password"
										icon={LockIcon}
										required
										size="lg"
										hint="Al menos 8 caracteres, con letras y números."
										bind:value={password}
										error={errorDe('password')}
									>
										{#snippet trailing()}
											<button
												type="button"
												onclick={() => (verPassword = !verPassword)}
												aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
												aria-pressed={verPassword}
												class="grid size-10 place-items-center rounded-lg text-light-two_d transition-colors hover:text-light-two focus-visible:outline-2 focus-visible:outline-light-three dark:text-dark-two_d dark:hover:text-dark-two dark:focus-visible:outline-dark-three"
											>
												{#if verPassword}<EyeOffIcon />{:else}<EyeIcon />{/if}
											</button>
										{/snippet}
									</Input>
								{:else}
									<div class="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
										<Input
											label="Prefijo"
											list={listaPrefijos}
											placeholder="Dra."
											maxlength={30}
											size="lg"
											bind:value={prefijo}
											error={errorDe('tarjeta.prefijo')}
										/>
										<Input
											label="Nombres"
											required
											maxlength={150}
											size="lg"
											autocomplete="given-name"
											bind:value={nombres}
											error={errorDe('tarjeta.nombres')}
										/>
									</div>
									<datalist id={listaPrefijos}>
										{#each PREFIJOS_SUGERIDOS as opcion (opcion)}<option value={opcion}
											></option>{/each}
									</datalist>
									<Input
										label="Apellidos"
										maxlength={150}
										size="lg"
										autocomplete="family-name"
										bind:value={apellidos}
										error={errorDe('tarjeta.apellidos')}
									/>
									<RubroCombobox
										bind:value={rubro}
										error={errorDe('tarjeta.rubro')}
										hint={inicio}
									/>
									<Input
										label="Cargo"
										placeholder="Pediatra, Agente inmobiliaria…"
										maxlength={150}
										size="lg"
										hint="Opcional. Si lo dejas vacío, se muestra tu rubro."
										bind:value={cargo}
										error={errorDe('tarjeta.cargo')}
									/>
								{/if}
							</div>

							{#if paso === 3}
								<p class="mt-6 text-sm text-light-two_d dark:text-dark-two_d">
									Empiezas con el plan Free: armas tu tarjeta completa y la ves tal como la verán
									tus clientes. Para publicarla, activas Pro.
								</p>
							{/if}
						</div>
					{/key}

					<Button
						type="submit"
						variant="accent"
						size="lg"
						fullWidth
						class="mt-8"
						loading={paso === 3 ? estado.enviando : revisandoEnlace}
					>
						{paso === 3 ? 'Crear mi tarjeta' : 'Continuar'}
					</Button>
				</form>
			</div>

			<p class="mx-auto w-full max-w-[27rem] text-sm text-light-two_d dark:text-dark-two_d">
				¿Ya tienes cuenta?
				<a
					href={resolve('/auth/sign-in')}
					class="font-semibold text-light-two underline decoration-light-four underline-offset-4 hover:decoration-light-two dark:text-dark-two dark:decoration-dark-four dark:hover:decoration-dark-two"
				>
					Inicia sesión
				</a>
			</p>
		</main>

		<!-- La tarjeta que se arma: solo con espacio para verla al lado -->
		<aside
			class="hidden items-center justify-center bg-light-one_d px-10 py-16 lg:flex dark:bg-dark-one_d/50"
			aria-label="Tu tarjeta mientras la armas"
		>
			<VistaPreviaRegistro {slug} {prefijo} {nombres} {apellidos} {cargo} {rubro} />
		</aside>
	</div>
</MainLayout>
