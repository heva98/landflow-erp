import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'

import { useUpdateLeadStatusMutation } from '../hooks/use-leads'
import { canEditLeads } from '../lib/permissions'
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, LEAD_STATUSES, type Lead, type LeadStatus } from '../types'

interface LeadKanbanBoardProps {
  leads: Lead[]
}

export function LeadKanbanBoard({ leads }: LeadKanbanBoardProps) {
  const { user } = useAuth()
  const canDrag = canEditLeads(user?.permissions)
  const updateStatus = useUpdateLeadStatusMutation()
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null)

  const leadsByStatus = LEAD_STATUSES.reduce<Record<LeadStatus, Lead[]>>(
    (acc, status) => {
      acc[status] = leads.filter((lead) => lead.status === status)
      return acc
    },
    {} as Record<LeadStatus, Lead[]>,
  )

  function handleDrop(status: LeadStatus, event: React.DragEvent) {
    event.preventDefault()
    setDragOverColumn(null)
    const leadId = event.dataTransfer.getData('text/plain')
    const lead = leads.find((item) => item.id === leadId)
    if (leadId && lead && lead.status !== status) {
      updateStatus.mutate({ id: leadId, status })
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {LEAD_STATUSES.map((status) => (
        <div
          key={status}
          onDragOver={(event) => {
            if (!canDrag) return
            event.preventDefault()
            setDragOverColumn(status)
          }}
          onDragLeave={() => setDragOverColumn((current) => (current === status ? null : current))}
          onDrop={(event) => canDrag && handleDrop(status, event)}
          className={cn(
            'flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10',
            dragOverColumn === status && 'ring-2 ring-primary',
          )}
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-foreground">{LEAD_STATUS_LABELS[status]}</h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {leadsByStatus[status].length}
            </span>
          </div>

          <div className="flex min-h-16 flex-col gap-2">
            {leadsByStatus[status].map((lead) => (
              <div
                key={lead.id}
                draggable={canDrag}
                onDragStart={(event) => event.dataTransfer.setData('text/plain', lead.id)}
                className={cn(
                  'flex flex-col gap-1 rounded-lg bg-background p-3 text-sm ring-1 ring-foreground/10',
                  canDrag && 'cursor-grab active:cursor-grabbing',
                )}
              >
                <Link to={`/crm/leads/${lead.id}`} className="font-medium text-foreground hover:underline">
                  {lead.full_name}
                </Link>
                {lead.phone && <p className="text-xs text-muted-foreground">{lead.phone}</p>}
                {lead.interested_project_name && (
                  <p className="text-xs text-muted-foreground">{lead.interested_project_name}</p>
                )}
                <p className="text-xs text-muted-foreground/80">{LEAD_SOURCE_LABELS[lead.source]}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
