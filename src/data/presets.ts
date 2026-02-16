import { OFFICIAL_WEIGHTS } from '@/data/categories'

export interface WeightPreset {
  id: string
  name: string
  icon: string
  description: string
  weights: Record<string, number>
}

export const PRESETS: WeightPreset[] = [
  {
    id: 'oficial',
    name: 'Oficial INE',
    icon: '📊',
    description: 'Ponderaciones oficiales del INE para 2024',
    weights: { ...OFFICIAL_WEIGHTS },
  },
  {
    id: 'pensionista-propietario',
    name: 'Pensionista (propietario)',
    icon: '🏠',
    description: 'Vivienda en propiedad: suministros, comunidad, IBI, alto gasto en alimentación y sanidad',
    weights: {
      '01': 28.0, '02': 2.0, '03': 2.5, '04': 18.0,
      '05': 6.0, '06': 13.0, '07': 7.0, '08': 3.0,
      '09': 5.0, '10': 0.5, '11': 6.0, '12': 9.0,
    },
  },
  {
    id: 'pensionista-inquilino',
    name: 'Pensionista (inquilino)',
    icon: '👴',
    description: 'Vivienda en alquiler: alto gasto en vivienda, alimentación y sanidad',
    weights: {
      '01': 28.0, '02': 2.5, '03': 3.0, '04': 22.0,
      '05': 5.0, '06': 12.0, '07': 8.0, '08': 3.5,
      '09': 4.0, '10': 0.5, '11': 5.0, '12': 6.5,
    },
  },
  {
    id: 'familia',
    name: 'Familia con hijos',
    icon: '👨‍👩‍👧‍👦',
    description: 'Alto gasto en alimentación, educación y vivienda',
    weights: {
      '01': 25.0, '02': 1.5, '03': 7.0, '04': 18.0,
      '05': 7.5, '06': 4.0, '07': 12.0, '08': 3.0,
      '09': 6.0, '10': 6.0, '11': 5.0, '12': 5.0,
    },
  },
  {
    id: 'joven',
    name: 'Joven soltero/a',
    icon: '🧑',
    description: 'Alto gasto en vivienda (alquiler), ocio y restaurantes',
    weights: {
      '01': 12.0, '02': 3.5, '03': 5.0, '04': 35.0,
      '05': 2.5, '06': 1.5, '07': 10.0, '08': 3.0,
      '09': 8.0, '10': 1.0, '11': 14.0, '12': 4.5,
    },
  },
  {
    id: 'autonomo',
    name: 'Autónomo',
    icon: '💼',
    description: 'Transporte y comunicaciones altos, gastos profesionales mixtos',
    weights: {
      '01': 18.0, '02': 2.5, '03': 3.5, '04': 15.0,
      '05': 5.0, '06': 3.5, '07': 18.0, '08': 6.0,
      '09': 5.0, '10': 2.0, '11': 14.0, '12': 7.5,
    },
  },
  {
    id: 'estudiante',
    name: 'Estudiante',
    icon: '🎓',
    description: 'Alto gasto en vivienda compartida, educación y ocio, bajo en transporte propio',
    weights: {
      '01': 15.0, '02': 4.0, '03': 5.0, '04': 28.0,
      '05': 2.0, '06': 2.0, '07': 8.0, '08': 5.0,
      '09': 10.0, '10': 8.0, '11': 10.0, '12': 3.0,
    },
  },
  {
    id: 'pareja-sin-hijos',
    name: 'Pareja sin hijos',
    icon: '👫',
    description: 'Equilibrio entre vivienda, restaurantes y ocio, sin gastos de educación infantil',
    weights: {
      '01': 20.0, '02': 3.5, '03': 5.0, '04': 18.0,
      '05': 6.0, '06': 3.0, '07': 12.0, '08': 3.0,
      '09': 9.0, '10': 1.0, '11': 14.0, '12': 5.5,
    },
  },
  {
    id: 'teletrabajador',
    name: 'Teletrabajador',
    icon: '🏡',
    description: 'Mayor gasto en vivienda y suministros, menor en transporte y restaurantes',
    weights: {
      '01': 22.0, '02': 3.0, '03': 3.0, '04': 20.0,
      '05': 8.0, '06': 4.0, '07': 5.0, '08': 6.0,
      '09': 10.0, '10': 2.0, '11': 10.0, '12': 7.0,
    },
  },
  {
    id: 'rural',
    name: 'Rural',
    icon: '🌾',
    description: 'Alto gasto en transporte (distancias), alimentación local, menor vivienda',
    weights: {
      '01': 25.0, '02': 3.0, '03': 3.5, '04': 10.0,
      '05': 7.0, '06': 5.0, '07': 18.0, '08': 3.0,
      '09': 6.0, '10': 2.0, '11': 10.0, '12': 7.5,
    },
  },
  {
    id: 'pareja-joven',
    name: 'Pareja joven',
    icon: '💑',
    description: 'Vivienda alta (alquiler), mucho ocio y restaurantes, bajo en sanidad',
    weights: {
      '01': 15.0, '02': 4.0, '03': 5.0, '04': 28.0,
      '05': 3.0, '06': 2.0, '07': 10.0, '08': 3.5,
      '09': 8.0, '10': 1.0, '11': 15.0, '12': 5.5,
    },
  },
]
