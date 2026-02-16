export interface IPCCategory {
  name: string
  data: Record<string, number>
}

export interface IPCRegion {
  name: string
  categories: Record<string, IPCCategory>
}

export interface IPCData {
  lastUpdated: string
  months: string[]
  regions: Record<string, IPCRegion>
}

export interface CategoryVariation {
  code: string
  name: string
  variation: number
  weight: number
  contribution: number
}

export interface IPCResult {
  personalIPC: number
  officialIPC: number
  difference: number
  evolution: { month: string; personal: number; official: number }[]
  breakdown: CategoryVariation[]
}
