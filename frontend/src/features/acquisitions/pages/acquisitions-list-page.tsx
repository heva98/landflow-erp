import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { AcquisitionStatusBadge } from '../components/acquisition-status-badge'
import { useAcquisitionsQuery } from '../hooks/use-acquisitions'
import { canAddAcquisitions } from '../lib/permissions'
import { ACQUISITION_STATUS_LABELS, ACQUISITION_STATUSES, type AcquisitionStatus } from '../types'

export function AcquisitionsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AcquisitionStatus | 'all'>('all')
  const { user } = useAuth()
  const canAdd = canAddAcquisitions(user?.permissions)

  const { data, isLoading, isError } = useAcquisitionsQuery({
    search: search || undefined,
    status: status === 'all' ? undefined : status,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Land Acquisitions</h1>
        {canAdd && (
          <Button asChild>
            <Link to="/acquisitions/new">
              <Plus /> New acquisition
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference, name or location"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as AcquisitionStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ACQUISITION_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {ACQUISITION_STATUS_LABELS[value]}
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
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Area (sqm)</TableHead>
              <TableHead>Asking price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading acquisitions…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">
                  Failed to load acquisitions.
                </TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No land acquisitions yet.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((acquisition) => (
              <TableRow
                key={acquisition.id}
                className="cursor-pointer"
                onClick={() => navigate(`/acquisitions/${acquisition.id}`)}
              >
                <TableCell className="font-medium text-foreground">
                  <Link to={`/acquisitions/${acquisition.id}`} className="hover:underline">
                    {acquisition.reference_number}
                  </Link>
                </TableCell>
                <TableCell>{acquisition.name}</TableCell>
                <TableCell>{acquisition.location}</TableCell>
                <TableCell>
                  <AcquisitionStatusBadge status={acquisition.status} />
                </TableCell>
                <TableCell>{Number(acquisition.area_sqm).toLocaleString()}</TableCell>
                <TableCell>{formatTZS(acquisition.asking_price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
