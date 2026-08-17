import { Plus, QrCode, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { SiteVisitStatusBadge } from '../components/status-badges'
import { useSiteVisitsQuery } from '../hooks/use-site-visits'
import { canManageSiteVisits } from '../lib/permissions'
import { SITE_VISIT_STATUS_LABELS, SITE_VISIT_STATUSES, type SiteVisitStatus } from '../types'

export function SiteVisitsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SiteVisitStatus | 'all'>('all')
  const { user } = useAuth()
  const canAdd = canManageSiteVisits(user?.permissions)

  const { data, isLoading, isError } = useSiteVisitsQuery({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Site Visits</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/site-visits/directory">Drivers &amp; buses</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/site-visits/check-in">
              <QrCode /> Check-in
            </Link>
          </Button>
          {canAdd && (
            <Button asChild>
              <Link to="/site-visits/new">
                <Plus /> New visit
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference or project"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SiteVisitStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {SITE_VISIT_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {SITE_VISIT_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Visit date</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Checked in</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading site visits…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">
                  Failed to load site visits.
                </TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No site visits yet.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((visit) => (
              <TableRow key={visit.id} className="cursor-pointer" onClick={() => navigate(`/site-visits/${visit.id}`)}>
                <TableCell className="font-medium text-foreground">
                  <Link to={`/site-visits/${visit.id}`} className="hover:underline">
                    {visit.reference_number}
                  </Link>
                </TableCell>
                <TableCell>{visit.project_name}</TableCell>
                <TableCell>{visit.visit_date}</TableCell>
                <TableCell>{visit.booking_count}</TableCell>
                <TableCell>{visit.checked_in_count}</TableCell>
                <TableCell>
                  <SiteVisitStatusBadge status={visit.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
