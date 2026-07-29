import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { LeadKanbanBoard } from '../components/lead-kanban-board'
import { useLeadsQuery } from '../hooks/use-leads'
import { LEAD_SOURCE_LABELS, LEAD_SOURCES, type LeadSource } from '../types'

export function LeadsPipelinePage() {
  const [search, setSearch] = useState('')
  const [source, setSource] = useState<LeadSource | 'all'>('all')

  const { data, isLoading, isError } = useLeadsQuery({
    search: search || undefined,
    source: source === 'all' ? undefined : source,
    page_size: 200,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Lead pipeline</h1>
        <Button asChild>
          <Link to="/crm/leads/new">
            <Plus /> New lead
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone or email"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={source} onValueChange={(value) => setSource(value as LeadSource | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {LEAD_SOURCES.map((value) => (
              <SelectItem key={value} value={value}>
                {LEAD_SOURCE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading leads…</p>}
      {isError && <p className="text-destructive">Failed to load leads.</p>}
      {data && <LeadKanbanBoard leads={data.results} />}
    </div>
  )
}
