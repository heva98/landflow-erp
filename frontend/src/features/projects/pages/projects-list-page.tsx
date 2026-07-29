import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { ProjectStatusBadge } from '../components/project-status-badge'
import { useProjectsQuery } from '../hooks/use-projects'
import { canViewProjectFinancials } from '../lib/permissions'
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, type ProjectStatus } from '../types'

export function ProjectsListPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all')
  const { user } = useAuth()
  const canViewFinancials = canViewProjectFinancials(user?.permissions)

  const { data, isLoading, isError } = useProjectsQuery({
    search: search || undefined,
    status: status === 'all' ? undefined : status,
  })
  const columnCount = canViewFinancials ? 6 : 4

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        <Button asChild>
          <Link to="/projects/new">
            <Plus /> New project
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or location"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {PROJECT_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Area (sqm)</TableHead>
              {canViewFinancials && (
                <>
                  <TableHead>Expected revenue</TableHead>
                  <TableHead>ROI</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                  Loading projects…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-destructive">
                  Failed to load projects.
                </TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                  No projects yet.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium text-foreground">
                  <Link to={`/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>{project.location}</TableCell>
                <TableCell>
                  <ProjectStatusBadge status={project.status} />
                </TableCell>
                <TableCell>{Number(project.total_area_sqm).toLocaleString()}</TableCell>
                {canViewFinancials && (
                  <>
                    <TableCell>{project.expected_revenue !== undefined ? formatTZS(project.expected_revenue) : '—'}</TableCell>
                    <TableCell>
                      {project.roi_percent == null ? '—' : `${Number(project.roi_percent).toFixed(1)}%`}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
