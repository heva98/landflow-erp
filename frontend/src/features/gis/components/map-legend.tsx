import { PLOT_STATUS_LABELS, PLOT_STATUSES } from '@/features/plots/types'

import { PLOT_STATUS_COLORS } from '../lib/plot-colors'

export function MapLegend() {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-card p-3 text-sm shadow-lg ring-1 ring-foreground/10">
      <p className="mb-1 font-medium text-foreground">Plot status</p>
      {PLOT_STATUSES.map((status) => (
        <div key={status} className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ backgroundColor: PLOT_STATUS_COLORS[status] }} />
          <span className="text-muted-foreground">{PLOT_STATUS_LABELS[status]}</span>
        </div>
      ))}
    </div>
  )
}
