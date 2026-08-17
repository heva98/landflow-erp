import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Input } from '@/components/ui/input'
import type { Plot } from '@/features/plots/types'

export function PlotSearch({
  plots,
  onSelect,
  placeholder = 'Search by plot number or project',
}: {
  plots: Plot[]
  onSelect: (plot: Plot) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState('')

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return plots
      .filter(
        (plot) =>
          plot.plot_number.toLowerCase().includes(term) || plot.project_name.toLowerCase().includes(term),
      )
      .slice(0, 8)
  }, [plots, query])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="w-72 bg-card pl-8"
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {matches.length > 0 && (
        <ul className="absolute top-full left-0 z-10 mt-1 w-72 overflow-hidden rounded-lg bg-card shadow-lg ring-1 ring-foreground/10">
          {matches.map((plot) => (
            <li key={plot.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onSelect(plot)
                  setQuery('')
                }}
              >
                <span className="font-medium text-foreground">{plot.plot_number}</span>
                <span className="text-xs text-muted-foreground">{plot.project_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
