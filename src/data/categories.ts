export interface Category {
  code: string
  name: string
  icon: string
  officialWeight: number
  tooltip: string
  keywords: string[]
}

export const CATEGORIES: Category[] = [
  {
    code: '01',
    name: 'Alimentos y bebidas no alcohólicas',
    icon: '🛒',
    officialWeight: 21.9,
    tooltip: 'Pan, cereales, carne, pescado, leche, huevos, frutas, verduras, azúcar, café',
    keywords: ['alimentos'],
  },
  {
    code: '02',
    name: 'Bebidas alcohólicas y tabaco',
    icon: '🍷',
    officialWeight: 3.2,
    tooltip: 'Vino, cerveza, licores, tabaco',
    keywords: ['alcohólicas', 'tabaco', 'estupefacientes'],
  },
  {
    code: '03',
    name: 'Vestido y calzado',
    icon: '👗',
    officialWeight: 4.8,
    tooltip: 'Ropa hombre/mujer/niño, calzado, reparaciones',
    keywords: ['vestido'],
  },
  {
    code: '04',
    name: 'Vivienda, agua, electricidad, gas',
    icon: '🏠',
    officialWeight: 13.5,
    tooltip: 'Alquiler, comunidad, agua, electricidad, gas, calefacción, reparaciones hogar',
    keywords: ['vivienda'],
  },
  {
    code: '05',
    name: 'Muebles y artículos del hogar',
    icon: '🛋️',
    officialWeight: 6.1,
    tooltip: 'Muebles, textil hogar, electrodomésticos, utensilios, limpieza',
    keywords: ['muebles'],
  },
  {
    code: '06',
    name: 'Sanidad',
    icon: '🏥',
    officialWeight: 4.6,
    tooltip: 'Medicamentos, servicios médicos, dentista, hospitalización',
    keywords: ['sanidad'],
  },
  {
    code: '07',
    name: 'Transporte',
    icon: '🚗',
    officialWeight: 13.8,
    tooltip: 'Vehículos, carburantes, mantenimiento, seguros, transporte público',
    keywords: ['transporte'],
  },
  {
    code: '08',
    name: 'Comunicaciones',
    icon: '📱',
    officialWeight: 3.2,
    tooltip: 'Telefonía/internet, equipos de teléfono',
    keywords: ['comunicacion', 'información y comunic'],
  },
  {
    code: '09',
    name: 'Ocio y cultura',
    icon: '🎭',
    officialWeight: 8.2,
    tooltip: 'Audiovisuales, recreativos, prensa, libros, vacaciones',
    keywords: ['ocio', 'recreativ'],
  },
  {
    code: '10',
    name: 'Enseñanza',
    icon: '📚',
    officialWeight: 1.8,
    tooltip: 'Infantil, primaria, secundaria, superior, otros cursos',
    keywords: ['enseñanza', 'educación'],
  },
  {
    code: '11',
    name: 'Restaurantes y hoteles',
    icon: '🍽️',
    officialWeight: 12.8,
    tooltip: 'Restaurantes, cafeterías, comedores, hoteles',
    keywords: ['restaurante', 'alojamiento'],
  },
  {
    code: '12',
    name: 'Otros bienes y servicios',
    icon: '💼',
    officialWeight: 6.1,
    tooltip: 'Cuidado personal, joyería, seguros, servicios financieros',
    keywords: ['otros bienes', 'cuidado personal', 'seguros y servicio'],
  },
]

export const OFFICIAL_WEIGHTS: Record<string, number> = Object.fromEntries(
  CATEGORIES.map((c) => [c.code, c.officialWeight])
)
