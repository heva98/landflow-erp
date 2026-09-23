import { Ruler, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { formatDistance } from '../lib/geo'

export function MeasurePanel({
  active,
  pointCount,
  distanceMeters,
  onToggle,
  onClear,
}: {
  active: boolean
  pointCount: number
  distanceMeters: number
  onToggle: () => void
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-card p-2 shadow-lg ring-1 ring-foreground/10">
      <Button size="sm" variant={active ? 'default' : 'outline'} onClick={onToggle}>
        <Ruler /> {active ? 'Measuring…' : 'Measure distance'}
      </Button>
      {active && (
        <>
          <span className="text-sm text-muted-foreground">
            {pointCount > 0 ? formatDistance(distanceMeters) : 'Click the map to start'}
          </span>
          {pointCount > 0 && (
            <Button size="icon" variant="ghost" onClick={onClear} aria-label="Clear measurement">
              <X className="size-4" />
            </Button>
          )}
        </>
      )}
    </div>
  )
}
