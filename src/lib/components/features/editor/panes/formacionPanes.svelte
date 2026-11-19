<!--
	Formación, certificaciones y preguntas frecuentes: listas simples con el mismo patrón.
	`tipo` elige cuál se edita.
-->
<script lang="ts">
	import { CertificateIcon, HelpCircleIcon, SchoolIcon } from '#lib/icons/outline/index.ts';
	import type {
		TarjetaCertificacion,
		TarjetaCertificacionCreateRequest,
		TarjetaEducacion,
		TarjetaEducacionCreateRequest,
		TarjetaFaq,
		TarjetaFaqCreateRequest
	} from '#lib/interfaces/index.ts';
	import {
		tarjetaCertificacionService,
		tarjetaEducacionService,
		tarjetaFaqService
	} from '#lib/services/index.ts';
	import { anioDe, ordenar } from '#lib/utils/tarjeta.ts';
	import EditorPanel from '../editorPanel.svelte';
	import { getEditor } from '../estadoEditor.svelte.ts';
	import CertificacionForm from '../formularios/certificacionForm.svelte';
	import EducacionForm from '../formularios/educacionForm.svelte';
	import FaqForm from '../formularios/faqForm.svelte';
	import PanelLista from '../panelLista.svelte';
	import TituloSeccion from '../tituloSeccion.svelte';

	interface Props {
		tipo: 'educacion' | 'certificaciones' | 'faq';
		alVolver?: () => void;
	}

	let { tipo, alVolver }: Props = $props();

	const editor = getEditor();
</script>

{#if tipo === 'educacion'}
	<EditorPanel
		titulo="Formación"
		descripcion="Tus estudios, en el orden en que quieres mostrarlos. Es opcional."
		{alVolver}
	>
		<TituloSeccion clave="educacion" />
		<div class="mt-6">
			<PanelLista
				items={ordenar(editor.tarjeta.educacion)}
				padreId={editor.tarjeta.id}
				servicio={tarjetaEducacionService}
				aplicar={(educacion: TarjetaEducacion[]) => editor.actualizar({ educacion })}
				nombre={(e) => e.titulo ?? e.institucion}
				singular="estudio"
				agregarLabel="Agregar estudio"
				vacio={{
					titulo: 'Sin estudios',
					descripcion: 'Agrega tu título o especialidad si suma a tu perfil.',
					icono: SchoolIcon
				}}
			>
				{#snippet fila(estudio: TarjetaEducacion)}
					<p class="truncate font-medium">{estudio.titulo ?? estudio.institucion}</p>
					<p class="truncate text-xs text-light-two_d dark:text-dark-two_d">
						{estudio.titulo ? estudio.institucion : ''}{estudio.fecha_inicio
							? ` (${anioDe(estudio.fecha_inicio)}–${estudio.is_actual ? 'actualidad' : (anioDe(estudio.fecha_fin) ?? '')})`
							: ''}
					</p>
				{/snippet}
				{#snippet formulario({
					inicial,
					id,
					guardar
				}: {
					inicial: TarjetaEducacion | null;
					id: string;
					guardar: (datos: TarjetaEducacionCreateRequest) => Promise<void>;
				})}
					<EducacionForm {inicial} {id} {guardar} />
				{/snippet}
			</PanelLista>
		</div>
	</EditorPanel>
{:else if tipo === 'certificaciones'}
	<EditorPanel
		titulo="Certificaciones"
		descripcion="Con su código y el enlace donde se verifican, dan confianza a primera vista."
		{alVolver}
	>
		<TituloSeccion clave="certificaciones" />
		<div class="mt-6">
			<PanelLista
				items={ordenar(editor.tarjeta.certificaciones)}
				padreId={editor.tarjeta.id}
				servicio={tarjetaCertificacionService}
				aplicar={(certificaciones: TarjetaCertificacion[]) =>
					editor.actualizar({ certificaciones })}
				nombre={(c) => c.nombre}
				singular="certificación"
				agregarLabel="Agregar certificación"
				femenino
				vacio={{
					titulo: 'Sin certificaciones',
					descripcion: 'Agrega matrículas, membresías o cursos con credencial.',
					icono: CertificateIcon
				}}
			>
				{#snippet fila(certificacion: TarjetaCertificacion)}
					<p class="truncate font-medium">{certificacion.nombre}</p>
					<p class="truncate text-xs text-light-two_d dark:text-dark-two_d">
						{certificacion.entidad_emisora ?? ''}
					</p>
				{/snippet}
				{#snippet formulario({
					inicial,
					id,
					guardar
				}: {
					inicial: TarjetaCertificacion | null;
					id: string;
					guardar: (datos: TarjetaCertificacionCreateRequest) => Promise<void>;
				})}
					<CertificacionForm {inicial} {id} {guardar} />
				{/snippet}
			</PanelLista>
		</div>
	</EditorPanel>
{:else}
	<EditorPanel
		titulo="Preguntas frecuentes"
		descripcion="Responde por adelantado lo que más te consultan: pagos, zonas, preparación."
		{alVolver}
	>
		<TituloSeccion clave="faq" />
		<div class="mt-6">
			<PanelLista
				items={ordenar(editor.tarjeta.faq)}
				padreId={editor.tarjeta.id}
				servicio={tarjetaFaqService}
				aplicar={(faq: TarjetaFaq[]) => editor.actualizar({ faq })}
				nombre={(f) => f.pregunta}
				singular="pregunta"
				agregarLabel="Agregar pregunta"
				femenino
				vacio={{
					titulo: 'Sin preguntas',
					descripcion: 'Agrega la pregunta que más te hacen por WhatsApp.',
					icono: HelpCircleIcon
				}}
			>
				{#snippet fila(pregunta: TarjetaFaq)}
					<p class="truncate font-medium">{pregunta.pregunta}</p>
					<p class="truncate text-xs text-light-two_d dark:text-dark-two_d">{pregunta.respuesta}</p>
				{/snippet}
				{#snippet formulario({
					inicial,
					id,
					guardar
				}: {
					inicial: TarjetaFaq | null;
					id: string;
					guardar: (datos: TarjetaFaqCreateRequest) => Promise<void>;
				})}
					<FaqForm {inicial} {id} {guardar} />
				{/snippet}
			</PanelLista>
		</div>
	</EditorPanel>
{/if}
