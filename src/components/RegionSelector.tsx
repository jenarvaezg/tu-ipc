import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGIONS } from '@/data/regions'

interface RegionSelectorProps {
  value: string
  onChange: (region: string) => void
  compact?: boolean
}

export default function RegionSelector({ value, onChange, compact }: RegionSelectorProps) {
  if (compact) {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Comunidad Autónoma</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r.code} value={r.code}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="mb-8 flex items-center gap-3">
      <label className="text-sm font-medium whitespace-nowrap">Comunidad Autónoma</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[260px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {REGIONS.map((r) => (
            <SelectItem key={r.code} value={r.code}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
