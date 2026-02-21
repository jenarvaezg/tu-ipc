import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGIONS } from '@/data/regions'
import { useId } from 'react'

interface RegionSelectorProps {
  value: string
  onChange: (region: string) => void
  compact?: boolean
}

export default function RegionSelector({ value, onChange, compact }: RegionSelectorProps) {
  const regionSelectId = useId()
  const regionLabelId = `${regionSelectId}-label`

  if (compact) {
    return (
      <div className="space-y-1.5">
        <label id={regionLabelId} htmlFor={regionSelectId} className="block text-sm font-medium">Comunidad Autónoma</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={regionSelectId} aria-labelledby={regionLabelId} className="w-full">
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
      <label id={regionLabelId} htmlFor={regionSelectId} className="text-sm font-medium whitespace-nowrap">Comunidad Autónoma</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={regionSelectId} aria-labelledby={regionLabelId} className="w-[260px]">
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
