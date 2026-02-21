export type RubricaLevel = 'grupo' | 'subgrupo' | 'clase' | 'subclase'

export interface RubricaSeriesPoint {
  month: string
  value: number
}

export interface RubricaSeries {
  id: string
  ineSeriesCode: string
  variableId: 762 | 763 | 764 | 765
  level: RubricaLevel
  rubricaId: number
  parentRubricaId?: number
  codigo: string
  nombre: string
  firstMonth: string
  lastMonth: string
  hasBaseMonth: boolean
  points: RubricaSeriesPoint[]
}

export interface RubricaCatalogNode {
  id: number
  variableId: 762 | 763 | 764 | 765
  level: RubricaLevel
  codigo: string
  nombre: string
  parentIds: number[]
}

export interface RubricasData {
  schemaVersion: '1.0'
  generatedAt: string
  baseMonth: string
  months: string[]
  series: RubricaSeries[]
  catalog: RubricaCatalogNode[]
}
