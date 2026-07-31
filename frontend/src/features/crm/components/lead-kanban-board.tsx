import { ChevronLeft, ChevronRight, MapPin, Phone } from 'lucide-react'
import { useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'

import { useUpdateLeadStatusMutation } from '../hooks/use-leads'
import { ageBadgeVariant, ageLabel, avatarColor, daysSince, initialsOf } from '../lib/lead-presentation'
import { canEditLeads } from '../lib/permissions'
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, type Lead, type LeadStatus } from '../types'

const ACTIVE_STATUSES: LeadStatus[] = ['new', 'contacted', 'interested', 'site_visit', 'negotiating', 'reserved']

const STATUS_DOT: Record<LeadStatus, string> = {
  new: '#64748B',
  contacted: '#2563EB',
  interested: '#4CAF50',
  site_visit: '#0E5B45',
  negotiating: '#C89B3C',
  reserved: '#B8860B',
  purchased: '#C89B3C',
  lost: '#94A3B8',
}

interface LeadKanbanBoardProps {
  leads: Lead[]
  selectMode: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onCardClick: (lead: Lead) => void
}

export function LeadKanbanBoard({ leads, selectMode, selectedIds, onToggleSelect, onCardClick }: LeadKanbanBoardProps) {
  const { user } = useAuth()
  const canDrag = canEditLeads(user?.permissions) && !selectMode
  const updateStatus = useUpdateLeadStatusMutation()
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null)
  const [lostExpanded, setLostExpanded] = useState(false)

  function leadsFor(status: LeadStatus) {
    return leads
      .filter((lead) => lead.status === status)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }

  function handleDragStart(lead: Lead, event: DragEvent) {
    if (!canDrag) return
    event.dataTransfer.setData('text/plain', lead.id)
  }

  function handleDrop(newStatus: LeadStatus, event: DragEvent) {
    event.preventDefault()
    setDragOverStatus(null)
    if (!canDrag) return
    const leadId = event.dataTransfer.getData('text/plain')
    const lead = leads.find((item) => item.id === leadId)
    if (leadId && lead && lead.status !== newStatus) {
      updateStatus.mutate({ id: leadId, status: newStatus })
    }
  }

  function dropZoneProps(status: LeadStatus) {
    return {
      onDragOver: (event: DragEvent) => {
        if (!canDrag) return
        event.preventDefault()
        setDragOverStatus(status)
      },
      onDragLeave: () => setDragOverStatus((current) => (current === status ? null : current)),
      onDrop: (event: DragEvent) => handleDrop(status, event),
    }
  }

  function renderCard(lead: Lead, variant: 'active' | 'purchased' | 'lost') {
    const days = daysSince(lead.updated_at)
    const selected = selectedIds.has(lead.id)

    return (
      <div
        key={lead.id}
        draggable={canDrag}
        onDragStart={(event) => handleDragStart(lead, event)}
        onClick={() => (selectMode ? onToggleSelect(lead.id) : onCardClick(lead))}
        className={cn(
          'flex flex-col gap-1.5 rounded-xl bg-card p-3 text-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-sm',
          canDrag && 'cursor-grab active:cursor-grabbing',
          selectMode && 'cursor-pointer',
          variant === 'lost' && 'opacity-80',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {selectMode && (
              <Checkbox
                checked={selected}
                onClick={(event) => event.stopPropagation()}
                onCheckedChange={() => onToggleSelect(lead.id)}
              />
            )}
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: avatarColor(lead.assigned_to_name) }}
            >
              {initialsOf(lead.assigned_to_name)}
            </span>
            <Link
              to={`/crm/leads/${lead.id}`}
              onClick={(event) => event.stopPropagation()}
              className="truncate font-medium text-foreground hover:underline"
            >
              {lead.full_name}
            </Link>
          </div>
          {variant === 'active' && (
            <Badge variant={ageBadgeVariant(days)} className="shrink-0">
              {ageLabel(days)}
            </Badge>
          )}
          {variant === 'purchased' && (
            <Badge variant="secondary" className="shrink-0">
              Won
            </Badge>
          )}
        </div>

        {variant === 'lost' ? (
          <>
            {lead.lost_reason && <p className="text-xs text-destructive italic">{lead.lost_reason}</p>}
            <p className="text-xs text-muted-foreground">Lost {ageLabel(days)} ago</p>
          </>
        ) : (
          <>
            {lead.phone && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="size-3 shrink-0" /> {lead.phone}
              </p>
            )}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              {lead.interested_project_name || lead.organization_name || 'No project yet'}
            </p>
            <div className="mt-1 flex items-center justify-between border-t border-border pt-1.5">
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {LEAD_SOURCE_LABELS[lead.source]}
                {lead.source === 'referral' && lead.referred_by_name ? ` · ${lead.referred_by_name}` : ''}
              </span>
              <span className="text-[11px] text-muted-foreground">{lead.assigned_to_name || 'Unassigned'}</span>
            </div>
          </>
        )}
      </div>
    )
  }

  const purchasedLeads = leadsFor('purchased')
  const lostLeads = leadsFor('lost')

  return (
    <div className="flex items-stretch gap-5 overflow-x-auto pb-2">
      <div className="flex gap-3.5 rounded-2xl bg-muted p-2.5">
        {ACTIVE_STATUSES.map((status) => {
          const statusLeads = leadsFor(status)
          const dragOver = dragOverStatus === status
          return (
            <div key={status} className="flex w-72 shrink-0 flex-col rounded-xl bg-background">
              <div className="flex items-center justify-between px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block size-2 rounded-full" style={{ backgroundColor: STATUS_DOT[status] }} />
                  <h3 className="text-sm font-semibold text-foreground">{LEAD_STATUS_LABELS[status]}</h3>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {statusLeads.length}
                </span>
              </div>
              <div
                {...dropZoneProps(status)}
                className={cn(
                  'flex min-h-16 flex-1 flex-col gap-2 rounded-lg border-2 border-dashed border-transparent px-2.5 pb-3',
                  dragOver && 'border-primary bg-primary/5',
                )}
              >
                {statusLeads.map((lead) => renderCard(lead, 'active'))}
                {statusLeads.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    No leads in this stage
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="w-px shrink-0 self-stretch bg-border" />

      <div className="flex w-72 shrink-0 flex-col rounded-xl bg-[#FBF6EA]">
        <div className="flex items-center justify-between px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: STATUS_DOT.purchased }} />
            <h3 className="text-sm font-semibold text-[#8A6D2F]">Purchased</h3>
          </div>
          <span className="rounded-full bg-[#F3E4BF] px-2 py-0.5 text-xs font-medium text-[#8A6D2F]">
            {purchasedLeads.length}
          </span>
        </div>
        <div
          {...dropZoneProps('purchased')}
          className={cn(
            'flex min-h-16 flex-1 flex-col gap-2 rounded-lg border-2 border-dashed border-transparent px-2.5 pb-3',
            dragOverStatus === 'purchased' && 'border-[#C89B3C] bg-[#F3E4BF]/40',
          )}
        >
          {purchasedLeads.map((lead) => renderCard(lead, 'purchased'))}
          {purchasedLeads.length === 0 && (
            <p className="rounded-lg border border-dashed border-[#EADFC0] p-4 text-center text-xs text-[#B08D4E]">
              No purchases yet
            </p>
          )}
        </div>
      </div>

      <div className="w-px shrink-0 self-stretch bg-border" />

      {lostExpanded ? (
        <div className="flex w-72 shrink-0 flex-col rounded-xl bg-muted opacity-90">
          <button
            type="button"
            onClick={() => setLostExpanded(false)}
            className="flex items-center justify-between px-2.5 py-2"
          >
            <div className="flex items-center gap-1.5">
              <ChevronLeft className="size-3.5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">Lost</h3>
            </div>
            <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {lostLeads.length}
            </span>
          </button>
          <div
            {...dropZoneProps('lost')}
            className={cn(
              'flex min-h-16 flex-1 flex-col gap-2 rounded-lg border-2 border-dashed border-transparent px-2.5 pb-3',
              dragOverStatus === 'lost' && 'border-muted-foreground/40 bg-background/60',
            )}
          >
            {lostLeads.map((lead) => renderCard(lead, 'lost'))}
            {lostLeads.length === 0 && (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No lost leads
              </p>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setLostExpanded(true)}
          onDragOver={(event) => canDrag && event.preventDefault()}
          onDrop={(event) => handleDrop('lost', event)}
          className="flex w-14 shrink-0 flex-col items-center justify-center gap-2.5 rounded-xl bg-muted py-3.5"
        >
          <ChevronRight className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground [writing-mode:vertical-rl] [transform:rotate(180deg)]">
            Lost
          </span>
          <span className="rounded-full bg-background px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {lostLeads.length}
          </span>
        </button>
      )}
    </div>
  )
}
