<!-- Imágenes de un ítem de la vitrina: la primera es la principal -->
<script lang="ts">
	import {
		ArrowLeftIcon,
		ChevronRightIcon,
		PhotoPlusIcon,
		XIcon
	} from '#lib/icons/outline/index.ts';
	import type { VitrinaItemImagenInput } from '#lib/interfaces/index.ts';
	import { errorService, uploadService } from '#lib/services/index.ts';

	interface Props {
		imagenes: VitrinaItemImagenInput[];
		maximo?: number;
	}

	let { imagenes = $bindable(), maximo = 10 }: Props = $props();

	let subiendo = $state(false);
	let error = $state('');
	let entrada = $state<HTMLInputElement>();
	const id = $props.id();

	async function subir(event: Event & { currentTarget: HTMLInputElement }) {
		const archivos = [...(event.currentTarget.files ?? [])].slice(0, maximo - imagenes.length);
		event.currentTarget.value = '';
		if (archivos.length === 0) return;
		subiendo = true;
		error = '';
		try {
			for (const archivo of archivos) {
				const { url } = await uploadService.subir(archivo, 'vitrina');
				imagenes = [...imagenes, { url, alt: null }];
			}
		} catch (causa) {
			error = errorService.getMessage(causa);
		} finally {
			subiendo = false;
		}
	}

	function mover(indice: number, paso: -1 | 1) {
		const lista = [...imagenes];
		[lista[indice], lista[indice + paso]] = [lista[indice + paso], lista[indice]];
		imagenes = lista;
	}

	const boton =
		'grid size-7 place-items-center rounded-full bg-light-one/90 text-light-two shadow-sm hover:bg-light-one disabled:opacity-0 dark:bg-dark-one/90 dark:text-dark-two';
</script>

<fieldset>
	<legend class="text-sm font-medium text-light-two dark:text-dark-two">Imágenes</legend>
	<p class="mt-0.5 text-xs text-light-two_d dark:text-dark-two_d">
		La primera es la principal. Hasta {maximo}.
	</p>
	<ul class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
		{#each imagenes as imagen, indice (imagen.url + indice)}
			<li class="overflow-hidden rounded-xl border border-light-four/40 dark:border-dark-one_d">
				<div class="relative aspect-[4/3] bg-light-one_d dark:bg-dark-one_d">
					<img src={imagen.url} alt="" class="size-full object-cover" />
					{#if indice === 0}
						<span
							class="absolute top-2 left-2 rounded-full bg-light-three px-2 py-0.5 text-[0.6875rem] font-semibold text-light-one dark:bg-dark-three dark:text-dark-one"
						>
							Principal
						</span>
					{/if}
					<div class="absolute top-2 right-2 flex gap-1">
						<button
							type="button"
							class={boton}
							aria-label="Mover la imagen {indice + 1} antes"
							disabled={indice === 0}
							onclick={() => mover(indice, -1)}
						>
							<ArrowLeftIcon class="size-3.5" />
						</button>
						<button
							type="button"
							class={boton}
							aria-label="Mover la imagen {indice + 1} después"
							disabled={indice === imagenes.length - 1}
							onclick={() => mover(indice, 1)}
						>
							<ChevronRightIcon class="size-3.5" />
						</button>
						<button
							type="button"
							class={boton}
							aria-label="Quitar la imagen {indice + 1}"
							onclick={() => (imagenes = imagenes.filter((_, i) => i !== indice))}
						>
							<XIcon class="size-3.5" />
						</button>
					</div>
				</div>
				<label class="block p-2">
					<span class="sr-only">Descripción de la imagen {indice + 1}</span>
					<input
						type="text"
						maxlength="150"
						placeholder="Describe la imagen"
						bind:value={imagenes[indice].alt}
						class="h-8 w-full rounded-lg border-0 bg-transparent px-1 text-xs text-light-two placeholder:text-light-four_d focus:ring-2 focus:ring-light-three/20 dark:text-dark-two"
					/>
				</label>
			</li>
		{/each}
		{#if imagenes.length < maximo}
			<li>
				<label
					for={id}
					class="flex aspect-[4/3] h-full min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-light-four text-sm font-medium text-light-two_d hover:bg-light-one_d has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-light-three dark:border-dark-four dark:text-dark-two_d dark:hover:bg-dark-one_d"
				>
					<PhotoPlusIcon class="size-6" />
					{subiendo ? 'Subiendo…' : 'Agregar imágenes'}
				</label>
				<input
					bind:this={entrada}
					{id}
					type="file"
					accept="image/*"
					multiple
					class="sr-only"
					disabled={subiendo}
					onchange={subir}
				/>
			</li>
		{/if}
	</ul>
	{#if error}<p class="mt-2 text-xs font-medium text-light-error dark:text-dark-error">
			{error}
		</p>{/if}
</fieldset>
