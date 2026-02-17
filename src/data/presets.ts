import { OFFICIAL_WEIGHTS } from '@/data/categories'

export interface WeightPreset {
  id: string
  name: string
  icon: string
  description: string
  weights: Record<string, number>
}

// Profile weights are based on:
// - INE Encuesta de Presupuestos Familiares (EPF) 2023/2024
// - INE IPC ponderaciones 2025 (base 2021)
// - CaixaBank Research: consumption patterns after retirement (2023)
// - CaixaBank Research: young adults consumption changes (2019)
// - EPF spending by quintile, household type, and age of household head
// See Methodology section for full references.

export const PRESETS: WeightPreset[] = [
  {
    id: 'oficial',
    name: 'Oficial INE',
    icon: '📊',
    description: 'Ponderaciones oficiales del IPC 2025 (base 2021)',
    weights: { ...OFFICIAL_WEIGHTS },
  },
  {
    id: 'pensionista-propietario',
    name: 'Pensionista (propietario)',
    icon: '🏠',
    description: 'EPF 65+: más alimentación y sanidad, menos transporte y ocio. Vivienda sin alquiler (suministros, IBI, comunidad)',
    weights: {
      '01': 24.0, '02': 2.5, '03': 2.5, '04': 15.0,
      '05': 6.0, '06': 11.0, '07': 8.0, '08': 3.0,
      '09': 7.0, '10': 0.5, '11': 10.5, '12': 10.0,
    },
  },
  {
    id: 'pensionista-inquilino',
    name: 'Pensionista (inquilino)',
    icon: '👴',
    description: 'EPF 65+ en alquiler: vivienda alta (alquiler + suministros), sanidad y alimentación dominan el presupuesto',
    weights: {
      '01': 22.0, '02': 2.0, '03': 2.0, '04': 25.0,
      '05': 4.0, '06': 10.0, '07': 6.0, '08': 3.0,
      '09': 4.5, '10': 0.5, '11': 8.0, '12': 13.0,
    },
  },
  {
    id: 'familia',
    name: 'Familia con hijos',
    icon: '👨‍👩‍👧‍👦',
    description: 'EPF pareja con hijos (gasto medio €43.163): educación, vestido y alimentación por encima de la media',
    weights: {
      '01': 21.0, '02': 2.0, '03': 6.0, '04': 13.0,
      '05': 6.0, '06': 5.0, '07': 14.5, '08': 3.5,
      '09': 7.5, '10': 7.0, '11': 8.0, '12': 6.5,
    },
  },
  {
    id: 'joven',
    name: 'Joven soltero/a',
    icon: '🧑',
    description: 'EPF <35 unipersonal (€22.226): vivienda alta (45% alquilan), restaurantes y ocio dominan, poco transporte propio',
    weights: {
      '01': 12.0, '02': 4.5, '03': 5.5, '04': 22.0,
      '05': 3.0, '06': 2.5, '07': 9.0, '08': 4.0,
      '09': 10.0, '10': 2.0, '11': 20.0, '12': 5.5,
    },
  },
  {
    id: 'autonomo',
    name: 'Autónomo',
    icon: '💼',
    description: 'Gastos mixtos personal/profesional: transporte y comunicaciones altos, comidas de trabajo, formación continua',
    weights: {
      '01': 16.0, '02': 3.0, '03': 4.0, '04': 14.0,
      '05': 5.0, '06': 5.0, '07': 18.0, '08': 5.0,
      '09': 6.0, '10': 2.5, '11': 15.0, '12': 6.5,
    },
  },
  {
    id: 'estudiante',
    name: 'Estudiante',
    icon: '🎓',
    description: 'Presupuesto ajustado: piso compartido en alquiler, matrícula y material dominan, transporte público',
    weights: {
      '01': 14.0, '02': 4.0, '03': 4.0, '04': 24.0,
      '05': 1.5, '06': 2.0, '07': 6.0, '08': 4.5,
      '09': 10.0, '10': 12.0, '11': 14.0, '12': 4.0,
    },
  },
  {
    id: 'pareja-sin-hijos',
    name: 'Pareja sin hijos',
    icon: '👫',
    description: 'EPF pareja sin hijos (€35.059): doble ingreso, alto gasto en restaurantes, ocio y viajes, sin educación',
    weights: {
      '01': 16.0, '02': 4.0, '03': 4.5, '04': 12.0,
      '05': 5.0, '06': 4.0, '07': 14.0, '08': 3.0,
      '09': 10.0, '10': 0.5, '11': 20.0, '12': 7.0,
    },
  },
  {
    id: 'teletrabajador',
    name: 'Teletrabajador',
    icon: '🏡',
    description: 'Sin desplazamiento: vivienda y suministros altos, equipamiento home office, más comida en casa, menos restaurantes',
    weights: {
      '01': 20.0, '02': 3.5, '03': 3.0, '04': 17.0,
      '05': 7.0, '06': 5.0, '07': 5.0, '08': 5.5,
      '09': 10.0, '10': 2.0, '11': 13.0, '12': 9.0,
    },
  },
  {
    id: 'rural',
    name: 'Rural',
    icon: '🌾',
    description: 'EPF municipios <10.000 hab.: transporte muy alto (coche imprescindible), vivienda barata, menos restaurantes',
    weights: {
      '01': 22.0, '02': 4.0, '03': 3.5, '04': 9.0,
      '05': 6.0, '06': 5.5, '07': 21.0, '08': 3.5,
      '09': 7.0, '10': 1.0, '11': 10.0, '12': 7.5,
    },
  },
  {
    id: 'pareja-joven',
    name: 'Pareja joven',
    icon: '💑',
    description: 'Pareja <35 en alquiler: vivienda compartida pero cara, mucha vida social, restaurantes y ocio altos',
    weights: {
      '01': 14.0, '02': 4.5, '03': 5.0, '04': 18.0,
      '05': 4.0, '06': 3.0, '07': 12.0, '08': 3.5,
      '09': 10.0, '10': 0.5, '11': 20.0, '12': 5.5,
    },
  },
]
