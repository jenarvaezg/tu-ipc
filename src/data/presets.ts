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
    weights: {
      '01': 21.9, '02': 3.2, '03': 4.8, '04': 13.5,
      '05': 6.1, '06': 4.6, '07': 13.8, '08': 3.2,
      '09': 8.2, '10': 1.8, '11': 12.8, '12': 6.1,
    },
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
]
