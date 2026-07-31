import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUsersQuery } from '@/features/accounts/hooks/use-users'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'

import { LeadBulkActionBar } from '../components/lead-bulk-action-bar'
import { LeadFormDialog } from '../components/lead-form-dialog'
import { LeadKanbanBoard } from '../components/lead-kanban-board'
import { LeadQuickAddDialog, type QuickAddValues } from '../components/lead-quick-add-dialog'
import { useBulkPatchLeadsMutation, useLeadsQuery } from '../hooks/use-leads'
import type { Lead, LeadStatus } from '../types'

const DATE_RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

export function LeadsPipelinePage() {
  const [search, setSearch] = useState('')
  const [agentId, setAgentId] = useState<string>('all')
  const [projectId, setProjectId] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')

  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [formDialog, setFormDialog] = useState<{ lead?: Lead; draft?: Partial<QuickAddValues> } | null>(null)

  const { data: projects } = useProjectsQuery()
  const { data: users } = useUsersQuery()

  const { data, isLoading, isError } = useLeadsQuery({
    search: search || undefined,
    assigned_to: agentId === 'all' ? undefined : agentId,
    interested_project: projectId === 'all' ? undefined : projectId,
    created_after: dateRange === 'all' ? undefined : daysAgoIso(Number(dateRange)),
    page_size: 200,
  })

  const bulkPatch = useBulkPatchLeadsMutation()

  const anyFilterActive = Boolean(search || agentId !== 'all' || projectId !== 'all' || dateRange !== 'all')

  function clearFilters() {
    setSearch('')
    setAgentId('all')
    setProjectId('all')
    setDateRange('all')
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleSelectMode() {
    setSelectMode((current) => !current)
    setSelectedIds(new Set())
  }

  const selectedIdList = useMemo(() => Array.from(selectedIds), [selectedIds])

  async function handleBulkMove(status: LeadStatus) {
    await bulkPatch.mutateAsync({ ids: selectedIdList, patch: { status } })
    setSelectedIds(new Set())
  }

  async function handleBulkAssign(userId: string) {
    await bulkPatch.mutateAsync({ ids: selectedIdList, patch: { assigned_to: userId } })
    setSelectedIds(new Set())
  }

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Lead pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {data?.count ?? 0} leads · {today}
          </p>
        </div>
        <Button onClick={() => setQuickAddOpen(true)}>
          <Plus /> New lead
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, project"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={agentId} onValueChange={setAgentId}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {users?.results.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-48">
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
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {anyFilterActive && (
          <Button type="button" variant="link" className="h-auto px-1 text-sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
        <div className="flex-1" />
        <Button type="button" variant={selectMode ? 'default' : 'outline'} onClick={toggleSelectMode}>
          {selectMode ? 'Cancel select' : 'Select'}
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading leads…</p>}
      {isError && <p className="text-destructive">Failed to load leads.</p>}
      {data && (
        <LeadKanbanBoard
          leads={data.results}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onCardClick={(lead) => setFormDialog({ lead })}
        />
      )}

      <LeadQuickAddDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSwitchToFull={(draft) => {
          setQuickAddOpen(false)
          setFormDialog({ draft })
        }}
      />

      <LeadFormDialog
        open={formDialog !== null}
        onOpenChange={(open) => !open && setFormDialog(null)}
        lead={formDialog?.lead}
        draft={formDialog?.draft}
      />

      <LeadBulkActionBar
        selectedCount={selectedIds.size}
        agents={users?.results ?? []}
        onMoveStage={handleBulkMove}
        onAssign={handleBulkAssign}
        onClear={() => setSelectedIds(new Set())}
      />
    </div>
  )
}
