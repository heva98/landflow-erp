import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'
import { formatTZS } from '@/lib/utils'

import { PlotStatusBadge } from '../components/plot-status-badge'
import { usePlotsQuery } from '../hooks/use-plots'
import { PLOT_STATUS_LABELS, PLOT_STATUSES, type PlotStatus } from '../types'

export function PlotsListPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PlotStatus | 'all'>('all')
  const [projectId, setProjectId] = useState<string>('all')

  const { data: projects } = useProjectsQuery()
  const { data, isLoading, isError } = usePlotsQuery({
    search: search || undefined,
    status: status === 'all' ? undefined : status,
    project: projectId === 'all' ? undefined : projectId,
  })
  const columnCount = 7

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Plots</h1>
        <Button asChild>
          <Link to="/plots/new">
            <Plus /> New plot
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by plot number, block or street"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects?.results.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(value) => setStatus(value as PlotStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PLOT_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {PLOT_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plot number</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Block / Street</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Area (sqm)</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                  Loading plots…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-destructive">
                  Failed to load plots.
                </TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                  No plots yet.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((plot) => (
              <TableRow key={plot.id}>
                <TableCell className="font-medium text-foreground">
                  <Link to={`/plots/${plot.id}`} className="hover:underline">
                    {plot.plot_number}
                  </Link>
                </TableCell>
                <TableCell>{plot.project_name}</TableCell>
                <TableCell>{[plot.block, plot.street].filter(Boolean).join(' / ') || '—'}</TableCell>
                <TableCell>
                  <PlotStatusBadge status={plot.status} />
                </TableCell>
                <TableCell>{Number(plot.area_sqm).toLocaleString()}</TableCell>
                <TableCell>{formatTZS(plot.price)}</TableCell>
                <TableCell>{plot.current_owner || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
