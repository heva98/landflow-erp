import { Search } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useAuditLogsQuery } from '../hooks/use-administration'
import { AUDIT_ACTIONS, type AuditAction } from '../types'

const ACTION_BADGE: Record<AuditAction, 'success' | 'info' | 'destructive'> = {
  create: 'success',
  update: 'info',
  delete: 'destructive',
}

export function AuditLogTab() {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState<AuditAction | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading } = useAuditLogsQuery({
    search: search || undefined,
    action: action === 'all' ? undefined : action,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search records"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={action} onValueChange={(value) => setAction(value as typeof action)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {AUDIT_ACTIONS.map((value) => (
              <SelectItem key={value} value={value} className="capitalize">{value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <span className="text-sm text-muted-foreground">to</span>
        <Input type="date" className="w-40" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Record</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No audit log entries found.</TableCell>
              </TableRow>
            )}
            {data?.results.map((entry, index) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </TableCell>
                <TableCell>{entry.actor_email ?? 'System'}</TableCell>
                <TableCell>
                  <Badge variant={ACTION_BADGE[entry.action]} className="capitalize">{entry.action}</Badge>
                </TableCell>
                <TableCell className="capitalize">{entry.content_type_model}</TableCell>
                <TableCell>{entry.object_repr}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
