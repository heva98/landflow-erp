import { Loader2, PenTool, Undo2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Plot } from '@/features/plots/types'

import { formatArea } from '../lib/geo'
import { PlotSearch } from './plot-search'

export function DrawPanel({
  active,
  onToggle,
  plots,
  targetPlot,
  onPickTarget,
  onClearTarget,
  pointCount,
  areaSqm,
  onUndo,
  onClear,
  onSave,
  isSaving,
  canEdit,
}: {
  active: boolean
  onToggle: () => void
  plots: Plot[]
  targetPlot: Plot | null
  onPickTarget: (plot: Plot) => void
  onClearTarget: () => void
  pointCount: number
  areaSqm: number
  onUndo: () => void
  onClear: () => void
  onSave: () => void
  isSaving: boolean
  canEdit: boolean
}) {
  if (!canEdit) return null

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-card p-2 shadow-lg ring-1 ring-foreground/10">
      <div className="flex items-center gap-2">
        <Button size="sm" variant={active ? 'default' : 'outline'} onClick={onToggle}>
          <PenTool /> {active ? 'Drawing…' : 'Draw plot boundary'}
        </Button>
        {active && pointCount > 0 && (
          <>
            <span className="text-sm text-muted-foreground">
              {pointCount} point{pointCount === 1 ? '' : 's'} · {formatArea(areaSqm)}
            </span>
            <Button size="icon" variant="ghost" onClick={onUndo} aria-label="Undo last point">
              <Undo2 className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onClear} aria-label="Clear drawing">
              <X className="size-4" />
            </Button>
          </>
        )}
      </div>

      {active && (
        <div className="flex items-center gap-2">
          {targetPlot ? (
            <span className="flex items-center gap-1 text-sm text-foreground">
              Saving to <strong>{targetPlot.plot_number}</strong> ({targetPlot.project_name})
              <Button size="icon" variant="ghost" onClick={onClearTarget} aria-label="Change target plot">
                <X className="size-4" />
              </Button>
            </span>
          ) : (
            <PlotSearch plots={plots} onSelect={onPickTarget} placeholder="Pick the plot this boundary is for" />
          )}
          {targetPlot && pointCount >= 3 && (
            <Button size="sm" disabled={isSaving} onClick={onSave}>
              {isSaving && <Loader2 className="animate-spin" />}
              Save boundary
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
