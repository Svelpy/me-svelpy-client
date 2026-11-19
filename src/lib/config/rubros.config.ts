/**
 * Catálogo de rubros para `tarjeta.rubro` (archivo de producción, no son datos de prueba).
 *
 * `tarjeta.rubro` es texto libre (varchar 150): esta lista solo sugiere valores en el panel y deriva:
 * - el tipo Schema.org del negocio en el JSON-LD de la tarjeta (GEO),
 * - el preset de colores, la tipografía y el título de la vitrina con que nace una tarjeta.
 * Un rubro que no está en la lista funciona igual: usa `ProfessionalService` y los valores por defecto.
 *
 * Cada grupo define los valores sugeridos; un rubro puede sobrescribir los suyos.
 */
import type { TemaPreset } from '#lib/interfaces/index.ts';
import { TEMA_PRESET_POR_DEFECTO } from './temasTarjeta.config';
import { TIPOGRAFIA_POR_DEFECTO } from './tipografiasTarjeta.config';

export interface GrupoRubro {
	id: string;
	nombre: string;
	preset: TemaPreset;
	/** Id de `TIPOGRAFIAS_TARJETA` */
	tipografia: number;
	/** Título por defecto de la sección vitrina ("Tratamientos", "Propiedades"…) */
	tituloVitrina: string;
	/** Tipo Schema.org por defecto del negocio */
	schema: string;
}

/** Rubro con los valores de su grupo ya resueltos */
export interface Rubro extends Omit<GrupoRubro, 'id' | 'nombre'> {
	nombre: string;
	grupo: string;
}

type Ajustes = Partial<Omit<Rubro, 'nombre' | 'grupo'>>;
type Entrada = string | [nombre: string, ajustes: Ajustes];

const GRUPOS: (GrupoRubro & { rubros: Entrada[] })[] = [
	{
		id: 'salud',
		nombre: 'Salud',
		preset: 'salud',
		tipografia: 1,
		tituloVitrina: 'Servicios',
		schema: 'Physician',
		rubros: [
			'Medicina general',
			'Medicina familiar',
			'Medicina interna',
			['Pediatría', { tipografia: 4, tituloVitrina: 'Consultas' }],
			'Ginecología y obstetricia',
			'Cardiología',
			'Dermatología',
			'Traumatología y ortopedia',
			'Oftalmología',
			'Otorrinolaringología',
			'Neurología',
			'Gastroenterología',
			'Endocrinología',
			'Urología',
			'Neumología',
			'Nefrología',
			'Oncología',
			'Reumatología',
			'Psiquiatría',
			'Cirugía general',
			'Cirugía plástica',
			'Anestesiología',
			'Geriatría',
			'Medicina deportiva',
			['Medicina estética', { preset: 'belleza', tituloVitrina: 'Tratamientos' }],
			['Odontología', { schema: 'Dentist', tituloVitrina: 'Tratamientos' }],
			['Ortodoncia', { schema: 'Dentist', tituloVitrina: 'Tratamientos' }],
			['Odontopediatría', { schema: 'Dentist', tituloVitrina: 'Tratamientos', tipografia: 4 }],
			['Endodoncia', { schema: 'Dentist', tituloVitrina: 'Tratamientos' }],
			['Implantología dental', { schema: 'Dentist', tituloVitrina: 'Tratamientos' }],
			['Fisioterapia y kinesiología', { schema: 'Physiotherapy', tituloVitrina: 'Tratamientos' }],
			[
				'Nutrición y dietética',
				{ schema: 'MedicalBusiness', preset: 'natural', tituloVitrina: 'Planes' }
			],
			['Enfermería', { schema: 'MedicalBusiness' }],
			['Fonoaudiología', { schema: 'MedicalBusiness' }],
			['Terapia ocupacional', { schema: 'MedicalBusiness' }],
			['Podología', { schema: 'MedicalBusiness' }],
			['Quiropráctica', { schema: 'MedicalBusiness' }],
			['Acupuntura', { schema: 'MedicalBusiness', preset: 'natural' }],
			['Optometría', { schema: 'Optician' }],
			['Óptica', { schema: 'Optician', tituloVitrina: 'Productos' }],
			['Farmacia', { schema: 'Pharmacy', tituloVitrina: 'Productos' }],
			['Laboratorio clínico', { schema: 'DiagnosticLab', tituloVitrina: 'Análisis' }],
			['Bioquímica', { schema: 'DiagnosticLab', tituloVitrina: 'Análisis' }],
			['Imagenología y radiología', { schema: 'DiagnosticLab', tituloVitrina: 'Estudios' }],
			['Clínica médica', { schema: 'MedicalClinic', tituloVitrina: 'Especialidades' }]
		]
	},
	{
		id: 'salud-mental',
		nombre: 'Salud mental y bienestar',
		preset: 'natural',
		tipografia: 2,
		tituloVitrina: 'Sesiones',
		schema: 'MedicalBusiness',
		rubros: [
			'Psicología clínica',
			['Psicología infantil', { tipografia: 4 }],
			['Psicología organizacional', { schema: 'ProfessionalService', tituloVitrina: 'Servicios' }],
			['Psicopedagogía', { schema: 'ProfessionalService', tipografia: 4 }],
			'Terapia de pareja y familia',
			'Neuropsicología',
			['Coaching de vida', { schema: 'ProfessionalService', tituloVitrina: 'Programas' }],
			['Meditación y mindfulness', { schema: 'ProfessionalService', tituloVitrina: 'Clases' }],
			['Masoterapia y masajes', { schema: 'HealthAndBeautyBusiness', tituloVitrina: 'Servicios' }],
			['Terapias alternativas', { schema: 'HealthAndBeautyBusiness' }]
		]
	},
	{
		id: 'legal',
		nombre: 'Legal',
		preset: 'elegante',
		tipografia: 3,
		tituloVitrina: 'Áreas de práctica',
		schema: 'Attorney',
		rubros: [
			'Abogacía',
			['Abogacía corporativa', { preset: 'corporativo' }],
			'Derecho penal',
			'Derecho de familia',
			'Derecho laboral',
			'Derecho civil',
			'Derecho tributario',
			'Derecho migratorio',
			'Propiedad intelectual',
			['Notaría de fe pública', { schema: 'Notary', tituloVitrina: 'Trámites' }],
			['Conciliación y arbitraje', { schema: 'LegalService' }],
			['Asesoría legal', { schema: 'LegalService', tituloVitrina: 'Servicios' }],
			['Peritaje judicial', { schema: 'ProfessionalService', tituloVitrina: 'Servicios' }],
			['Traducción jurada', { schema: 'ProfessionalService', tituloVitrina: 'Servicios' }]
		]
	},
	{
		id: 'finanzas',
		nombre: 'Finanzas, contabilidad y seguros',
		preset: 'corporativo',
		tipografia: 3,
		tituloVitrina: 'Servicios',
		schema: 'AccountingService',
		rubros: [
			'Contaduría pública',
			'Auditoría',
			'Asesoría tributaria',
			['Asesoría financiera', { schema: 'FinancialService' }],
			['Banca y créditos', { schema: 'FinancialService', tituloVitrina: 'Productos' }],
			['Microfinanzas', { schema: 'FinancialService', tituloVitrina: 'Productos' }],
			['Inversiones', { schema: 'FinancialService' }],
			['Casa de cambio', { schema: 'FinancialService' }],
			['Seguros', { schema: 'InsuranceAgency', tituloVitrina: 'Planes' }],
			['Corredor de seguros', { schema: 'InsuranceAgency', tituloVitrina: 'Planes' }],
			['Economía', { schema: 'ProfessionalService' }]
		]
	},
	{
		id: 'inmobiliaria',
		nombre: 'Inmobiliaria',
		preset: 'elegante',
		tipografia: 3,
		tituloVitrina: 'Propiedades',
		schema: 'RealEstateAgent',
		rubros: [
			'Agente inmobiliario',
			'Corredor de bienes raíces',
			'Inmobiliaria',
			'Administración de propiedades',
			'Alquileres temporarios',
			['Desarrollo inmobiliario', { tituloVitrina: 'Proyectos' }],
			['Tasación de inmuebles', { schema: 'ProfessionalService', tituloVitrina: 'Servicios' }],
			'Loteamientos y terrenos'
		]
	},
	{
		id: 'arquitectura',
		nombre: 'Arquitectura y diseño',
		preset: 'creativo',
		tipografia: 6,
		tituloVitrina: 'Proyectos',
		schema: 'ProfessionalService',
		rubros: [
			'Arquitectura',
			'Diseño de interiores',
			'Paisajismo',
			'Urbanismo',
			'Diseño industrial',
			'Renders y visualización 3D',
			['Topografía', { preset: 'corporativo', tituloVitrina: 'Servicios' }]
		]
	},
	{
		id: 'construccion',
		nombre: 'Construcción y oficios',
		preset: 'energia',
		tipografia: 9,
		tituloVitrina: 'Servicios',
		schema: 'HomeAndConstructionBusiness',
		rubros: [
			['Construcción', { schema: 'GeneralContractor', tituloVitrina: 'Obras' }],
			['Empresa constructora', { schema: 'GeneralContractor', tituloVitrina: 'Obras' }],
			['Albañilería', { schema: 'GeneralContractor' }],
			['Electricidad', { schema: 'Electrician' }],
			['Plomería', { schema: 'Plumber' }],
			['Pintura de interiores y exteriores', { schema: 'HousePainter' }],
			'Carpintería',
			'Herrería y soldadura',
			'Vidriería y aluminio',
			['Techos e impermeabilización', { schema: 'RoofingContractor' }],
			['Climatización y aire acondicionado', { schema: 'HVACBusiness' }],
			['Cerrajería', { schema: 'Locksmith' }],
			'Instalación de paneles solares',
			['Materiales de construcción', { schema: 'HardwareStore', tituloVitrina: 'Productos' }]
		]
	},
	{
		id: 'ingenieria',
		nombre: 'Ingeniería e industria',
		preset: 'corporativo',
		tipografia: 6,
		tituloVitrina: 'Servicios',
		schema: 'ProfessionalService',
		rubros: [
			'Ingeniería civil',
			'Ingeniería industrial',
			'Ingeniería eléctrica',
			'Ingeniería mecánica',
			'Ingeniería ambiental',
			'Ingeniería química',
			'Ingeniería de petróleo y gas',
			'Geología y minería',
			'Seguridad industrial',
			['Metalmecánica', { schema: 'LocalBusiness', preset: 'energia', tipografia: 9 }]
		]
	},
	{
		id: 'tecnologia',
		nombre: 'Tecnología',
		preset: 'oscuro',
		tipografia: 5,
		tituloVitrina: 'Servicios',
		schema: 'ProfessionalService',
		rubros: [
			'Desarrollo de software',
			'Desarrollo web',
			'Desarrollo de aplicaciones móviles',
			'Ingeniería de sistemas',
			'Ciberseguridad',
			'Ciencia de datos',
			'Inteligencia artificial',
			'Diseño UX/UI',
			'Redes y telecomunicaciones',
			'Soporte técnico informático',
			['Reparación de celulares', { schema: 'MobilePhoneStore', preset: 'claro' }],
			[
				'Venta de equipos tecnológicos',
				{ schema: 'ElectronicsStore', tituloVitrina: 'Productos', preset: 'claro' }
			]
		]
	},
	{
		id: 'marketing',
		nombre: 'Marketing y comunicación',
		preset: 'creativo',
		tipografia: 8,
		tituloVitrina: 'Servicios',
		schema: 'ProfessionalService',
		rubros: [
			'Marketing digital',
			'Agencia de publicidad',
			'Diseño gráfico',
			'Branding',
			'Community manager',
			'Producción de contenido',
			'Relaciones públicas',
			['Comunicación social', { tipografia: 2 }],
			['Periodismo', { tipografia: 2, preset: 'claro' }],
			['Copywriting y redacción', { tipografia: 2 }],
			['Imprenta y serigrafía', { schema: 'LocalBusiness', tituloVitrina: 'Productos' }]
		]
	},
	{
		id: 'educacion',
		nombre: 'Educación y capacitación',
		preset: 'claro',
		tipografia: 4,
		tituloVitrina: 'Cursos',
		schema: 'EducationalOrganization',
		rubros: [
			['Docencia', { schema: 'ProfessionalService' }],
			['Clases particulares', { schema: 'ProfessionalService', tituloVitrina: 'Clases' }],
			'Idiomas',
			['Educación inicial', { schema: 'Preschool', tituloVitrina: 'Niveles' }],
			['Colegio', { schema: 'School', tituloVitrina: 'Niveles' }],
			['Universidad', { schema: 'CollegeOrUniversity', tituloVitrina: 'Carreras' }],
			['Instituto técnico', { tituloVitrina: 'Carreras' }],
			['Capacitación empresarial', { schema: 'ProfessionalService', tipografia: 5 }],
			['Orientación vocacional', { schema: 'ProfessionalService', tituloVitrina: 'Servicios' }],
			['Educación especial', { tituloVitrina: 'Programas' }],
			[
				'Investigación científica',
				{ schema: 'ResearchOrganization', tituloVitrina: 'Líneas de trabajo', tipografia: 2 }
			]
		]
	},
	{
		id: 'belleza',
		nombre: 'Belleza y cuidado personal',
		preset: 'belleza',
		tipografia: 7,
		tituloVitrina: 'Servicios',
		schema: 'BeautySalon',
		rubros: [
			['Peluquería', { schema: 'HairSalon' }],
			['Peluquería y colorimetría', { schema: 'HairSalon' }],
			['Barbería', { schema: 'HairSalon', preset: 'oscuro', tipografia: 9 }],
			'Estética facial y corporal',
			['Manicura y pedicura', { schema: 'NailSalon' }],
			'Maquillaje profesional',
			['Spa', { schema: 'DaySpa', preset: 'natural' }],
			'Cosmetología',
			'Depilación',
			'Pestañas y cejas',
			['Tatuajes y piercing', { schema: 'TattooParlor', preset: 'oscuro', tipografia: 8 }],
			['Venta de cosméticos', { schema: 'Store', tituloVitrina: 'Productos' }]
		]
	},
	{
		id: 'deporte',
		nombre: 'Deporte y actividad física',
		preset: 'energia',
		tipografia: 9,
		tituloVitrina: 'Planes',
		schema: 'SportsActivityLocation',
		rubros: [
			['Entrenamiento personal', { schema: 'ProfessionalService' }],
			['Gimnasio', { schema: 'ExerciseGym' }],
			['Entrenamiento funcional', { schema: 'ExerciseGym' }],
			['Yoga y pilates', { preset: 'natural', tipografia: 2, tituloVitrina: 'Clases' }],
			['Artes marciales', { tituloVitrina: 'Clases' }],
			['Natación', { tituloVitrina: 'Clases' }],
			['Escuela de fútbol', { schema: 'SportsClub', tituloVitrina: 'Categorías' }],
			'Ciclismo',
			'Running y atletismo',
			['Nutrición deportiva', { schema: 'ProfessionalService' }],
			['Tienda deportiva', { schema: 'SportingGoodsStore', tituloVitrina: 'Productos' }]
		]
	},
	{
		id: 'gastronomia',
		nombre: 'Gastronomía',
		preset: 'calido',
		tipografia: 8,
		tituloVitrina: 'Menú',
		schema: 'Restaurant',
		rubros: [
			'Restaurante',
			['Cafetería', { schema: 'CafeOrCoffeeShop' }],
			['Panadería y pastelería', { schema: 'Bakery', tituloVitrina: 'Productos' }],
			['Repostería', { schema: 'Bakery', tituloVitrina: 'Productos' }],
			['Comida rápida', { schema: 'FastFoodRestaurant' }],
			['Heladería', { schema: 'IceCreamShop', tituloVitrina: 'Sabores' }],
			['Bar', { schema: 'BarOrPub', preset: 'oscuro', tituloVitrina: 'Carta' }],
			['Catering', { schema: 'FoodEstablishment', tituloVitrina: 'Paquetes' }],
			['Chef a domicilio', { schema: 'FoodEstablishment', tituloVitrina: 'Experiencias' }],
			['Comida saludable', { preset: 'natural' }],
			'Pizzería',
			'Parrillada y churrasquería',
			'Salteñería',
			'Food truck',
			['Cervecería artesanal', { schema: 'Brewery', tituloVitrina: 'Cervezas' }],
			[
				'Bodega y viñedo',
				{ schema: 'Winery', preset: 'elegante', tipografia: 7, tituloVitrina: 'Vinos' }
			],
			['Vinos y licores', { schema: 'LiquorStore', tituloVitrina: 'Productos' }]
		]
	},
	{
		id: 'turismo',
		nombre: 'Turismo y hospedaje',
		preset: 'natural',
		tipografia: 8,
		tituloVitrina: 'Paquetes',
		schema: 'TravelAgency',
		rubros: [
			'Agencia de viajes',
			'Guía de turismo',
			'Turismo de aventura',
			'Organización de excursiones',
			'Transporte turístico',
			[
				'Hotel',
				{ schema: 'Hotel', tituloVitrina: 'Habitaciones', preset: 'elegante', tipografia: 7 }
			],
			['Hostal', { schema: 'Hostel', tituloVitrina: 'Habitaciones' }],
			['Alojamiento turístico', { schema: 'LodgingBusiness', tituloVitrina: 'Alojamientos' }]
		]
	},
	{
		id: 'eventos',
		nombre: 'Eventos y celebraciones',
		preset: 'creativo',
		tipografia: 8,
		tituloVitrina: 'Paquetes',
		schema: 'ProfessionalService',
		rubros: [
			'Organización de eventos',
			['Wedding planner', { preset: 'belleza', tipografia: 7 }],
			'Decoración de eventos',
			['Salón de eventos', { schema: 'EventVenue', tituloVitrina: 'Salones' }],
			'Animación infantil',
			'DJ y sonido',
			'Banquetes',
			'Alquiler de mobiliario para eventos',
			['Florería', { schema: 'Florist', preset: 'belleza', tituloVitrina: 'Arreglos' }]
		]
	},
	{
		id: 'fotografia',
		nombre: 'Fotografía y audiovisual',
		preset: 'oscuro',
		tipografia: 2,
		tituloVitrina: 'Paquetes',
		schema: 'ProfessionalService',
		rubros: [
			'Fotografía de bodas',
			'Fotografía de retrato',
			'Fotografía de producto',
			'Fotografía de eventos',
			'Estudio fotográfico',
			'Video y producción audiovisual',
			'Filmación con drones',
			'Edición de video'
		]
	},
	{
		id: 'arte',
		nombre: 'Arte, música y cultura',
		preset: 'creativo',
		tipografia: 2,
		tituloVitrina: 'Servicios',
		schema: 'ProfessionalService',
		rubros: [
			'Músico',
			'Banda y agrupación musical',
			['Clases de música', { tituloVitrina: 'Clases' }],
			'Producción musical',
			['Artista plástico', { tituloVitrina: 'Obras' }],
			['Ilustración', { tituloVitrina: 'Trabajos' }],
			['Escritura y edición de libros', { tituloVitrina: 'Publicaciones' }],
			'Teatro y actuación',
			['Escuela de danza', { schema: 'DanceSchool', tituloVitrina: 'Clases' }],
			['Galería de arte', { schema: 'ArtGallery', tituloVitrina: 'Obras' }],
			['Artesanía', { schema: 'Store', tituloVitrina: 'Productos', preset: 'calido' }],
			'Locución'
		]
	},
	{
		id: 'moda',
		nombre: 'Moda y textil',
		preset: 'belleza',
		tipografia: 7,
		tituloVitrina: 'Colección',
		schema: 'ClothingStore',
		rubros: [
			['Diseño de modas', { schema: 'ProfessionalService' }],
			'Boutique',
			['Sastrería y costura', { schema: 'ProfessionalService', tituloVitrina: 'Servicios' }],
			['Confección textil', { schema: 'LocalBusiness', tituloVitrina: 'Productos' }],
			['Calzados', { schema: 'ShoeStore' }],
			['Joyería', { schema: 'JewelryStore', preset: 'elegante' }],
			'Accesorios',
			['Asesoría de imagen', { schema: 'ProfessionalService', tituloVitrina: 'Servicios' }]
		]
	},
	{
		id: 'comercio',
		nombre: 'Comercio y ventas',
		preset: 'claro',
		tipografia: 1,
		tituloVitrina: 'Productos',
		schema: 'Store',
		rubros: [
			'Tienda en línea',
			['Distribuidora', { schema: 'WholesaleStore' }],
			['Importadora', { schema: 'WholesaleStore' }],
			'Ventas por catálogo',
			['Minimarket', { schema: 'GroceryStore' }],
			['Ferretería', { schema: 'HardwareStore' }],
			['Librería y papelería', { schema: 'BookStore' }],
			['Mueblería', { schema: 'FurnitureStore' }],
			['Electrodomésticos', { schema: 'ElectronicsStore' }],
			['Juguetería', { schema: 'ToyStore' }],
			['Representante de ventas', { schema: 'ProfessionalService', tipografia: 5 }]
		]
	},
	{
		id: 'automotriz',
		nombre: 'Automotriz',
		preset: 'energia',
		tipografia: 9,
		tituloVitrina: 'Servicios',
		schema: 'AutoRepair',
		rubros: [
			'Taller mecánico',
			['Chapería y pintura', { schema: 'AutoBodyShop' }],
			['Lavado de autos', { schema: 'AutoWash' }],
			['Venta de vehículos', { schema: 'AutoDealer', tituloVitrina: 'Vehículos' }],
			['Repuestos automotrices', { schema: 'AutoPartsStore', tituloVitrina: 'Productos' }],
			['Llantería y alineado', { schema: 'TireShop' }],
			'Electricidad automotriz',
			['Escuela de conducción', { schema: 'DrivingSchool', tituloVitrina: 'Cursos' }],
			['Taller de motos', { schema: 'MotorcycleRepair' }],
			['Venta de motos', { schema: 'MotorcycleDealer', tituloVitrina: 'Motos' }],
			['Gestoría vehicular', { schema: 'ProfessionalService' }]
		]
	},
	{
		id: 'logistica',
		nombre: 'Transporte y logística',
		preset: 'corporativo',
		tipografia: 5,
		tituloVitrina: 'Servicios',
		schema: 'ProfessionalService',
		rubros: [
			'Logística',
			'Transporte de carga',
			'Courier y mensajería',
			['Mudanzas', { schema: 'MovingCompany' }],
			'Despachante de aduana',
			'Almacenes y depósitos',
			'Transporte de personas',
			'Delivery'
		]
	},
	{
		id: 'agro',
		nombre: 'Agro, veterinaria y mascotas',
		preset: 'natural',
		tipografia: 1,
		tituloVitrina: 'Servicios',
		schema: 'ProfessionalService',
		rubros: [
			['Veterinaria', { schema: 'VeterinaryCare', tipografia: 4 }],
			['Peluquería canina', { schema: 'LocalBusiness', tipografia: 4 }],
			['Tienda de mascotas', { schema: 'PetStore', tituloVitrina: 'Productos', tipografia: 4 }],
			'Adiestramiento canino',
			'Agronomía',
			['Producción agrícola', { tituloVitrina: 'Productos' }],
			['Ganadería', { tituloVitrina: 'Productos' }],
			['Avicultura', { tituloVitrina: 'Productos' }],
			['Apicultura', { tituloVitrina: 'Productos' }],
			['Agroinsumos', { schema: 'Store', tituloVitrina: 'Productos' }],
			['Maquinaria agrícola', { schema: 'Store', tituloVitrina: 'Equipos' }]
		]
	},
	{
		id: 'hogar',
		nombre: 'Hogar y servicios',
		preset: 'claro',
		tipografia: 9,
		tituloVitrina: 'Servicios',
		schema: 'LocalBusiness',
		rubros: [
			'Limpieza',
			'Jardinería',
			'Fumigación y control de plagas',
			['Lavandería', { schema: 'DryCleaningOrLaundry' }],
			'Reparación de electrodomésticos',
			'Mantenimiento',
			'Tapicería',
			['Decoración del hogar', { preset: 'calido', tipografia: 8 }],
			['Cuidado de niños', { schema: 'ChildCare', tipografia: 4 }],
			['Cuidado de adultos mayores', { tipografia: 4 }],
			['Reciclaje', { schema: 'RecyclingCenter', preset: 'natural' }]
		]
	},
	{
		id: 'consultoria',
		nombre: 'Consultoría y empresas',
		preset: 'corporativo',
		tipografia: 5,
		tituloVitrina: 'Servicios',
		schema: 'ProfessionalService',
		rubros: [
			'Consultoría empresarial',
			['Recursos humanos', { schema: 'EmploymentAgency' }],
			'Gestión de proyectos',
			'Administración de empresas',
			'Comercio exterior',
			'Ejecutivo comercial',
			'Gerencia general',
			'Emprendimiento',
			'Calidad y procesos',
			'Trámites y gestoría',
			['Traducción e interpretación', { tipografia: 2 }]
		]
	},
	{
		id: 'seguridad',
		nombre: 'Seguridad',
		preset: 'corporativo',
		tipografia: 9,
		tituloVitrina: 'Servicios',
		schema: 'ProfessionalService',
		rubros: [
			'Seguridad privada',
			'Cámaras y alarmas',
			'Seguridad electrónica',
			'Investigación privada',
			'Prevención de riesgos'
		]
	},
	{
		id: 'comunidad',
		nombre: 'Organizaciones y comunidad',
		preset: 'claro',
		tipografia: 1,
		tituloVitrina: 'Programas',
		schema: 'NGO',
		rubros: [
			'Organización sin fines de lucro',
			'Fundación',
			['Iglesia y ministerio', { schema: 'Church', tituloVitrina: 'Actividades', tipografia: 2 }],
			['Servicio público', { schema: 'GovernmentOffice', tituloVitrina: 'Servicios' }],
			['Política', { schema: 'Person', tituloVitrina: 'Propuestas' }],
			'Voluntariado',
			['Cooperativa', { schema: 'Organization', tituloVitrina: 'Servicios' }],
			['Asociación profesional', { schema: 'ProfessionalService', tituloVitrina: 'Servicios' }]
		]
	}
];

export const GRUPOS_RUBRO: GrupoRubro[] = GRUPOS.map(({ rubros: _rubros, ...grupo }) => grupo);

export const RUBROS: Rubro[] = GRUPOS.flatMap(({ rubros, id: _id, nombre: grupo, ...valores }) =>
	rubros.map((entrada) => {
		const [nombre, ajustes] = typeof entrada === 'string' ? [entrada, {}] : entrada;
		return { ...valores, ...ajustes, nombre, grupo };
	})
);

/** Valores para un rubro que no está en el catálogo */
export const RUBRO_GENERICO: Omit<Rubro, 'nombre' | 'grupo'> = {
	preset: TEMA_PRESET_POR_DEFECTO,
	tipografia: TIPOGRAFIA_POR_DEFECTO,
	tituloVitrina: 'Servicios',
	schema: 'ProfessionalService'
};

/** Compara sin mayúsculas ni tildes: "pediatria" encuentra "Pediatría" */
export function normalizarTexto(texto: string): string {
	return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const POR_NOMBRE = new Map(RUBROS.map((rubro) => [normalizarTexto(rubro.nombre), rubro]));

/** Rubro del catálogo con ese nombre (sin distinguir mayúsculas ni tildes) */
export function buscarRubro(nombre: string | null | undefined): Rubro | undefined {
	return nombre ? POR_NOMBRE.get(normalizarTexto(nombre)) : undefined;
}

/** Rubros que contienen el texto; primero los que empiezan con él */
export function sugerenciasDeRubro(texto: string, limite = 50): Rubro[] {
	const buscado = normalizarTexto(texto);
	if (!buscado) return RUBROS.slice(0, limite);
	const coincidencias = RUBROS.filter((rubro) => normalizarTexto(rubro.nombre).includes(buscado));
	return coincidencias
		.sort((a, b) => {
			const aEmpieza = normalizarTexto(a.nombre).startsWith(buscado) ? 0 : 1;
			const bEmpieza = normalizarTexto(b.nombre).startsWith(buscado) ? 0 : 1;
			return aEmpieza - bEmpieza;
		})
		.slice(0, limite);
}

/** Valores sugeridos para un rubro (los genéricos si no está en el catálogo) */
export function valoresDeRubro(nombre: string | null | undefined): Omit<Rubro, 'nombre' | 'grupo'> {
	return buscarRubro(nombre) ?? RUBRO_GENERICO;
}

/** Tipo Schema.org del negocio para el JSON-LD */
export function schemaDeRubro(nombre: string | null | undefined): string {
	return valoresDeRubro(nombre).schema;
}
