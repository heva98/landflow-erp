import { ArrowLeft, Pencil } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { LeadStatusBadge } from '../components/lead-status-badge'
import { useLeadQuery } from '../hooks/use-leads'
import { canEditLeads } from '../lib/permissions'
import { LEAD_SOURCE_LABELS } from '../types'

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canEdit = canEditLeads(user?.permissions)
  const { data: lead, isLoading, isError } = useLeadQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading lead…</p>
  }

  if (isError || !lead) {
    return <p className="text-destructive">Lead not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/crm/leads')} aria-label="Back to pipeline">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{lead.full_name}</h1>
            <p className="text-sm text-muted-foreground">{LEAD_SOURCE_LABELS[lead.source]}</p>
          </div>
          <LeadStatusBadge status={lead.status} />
        </div>
        {canEdit && (
          <Button asChild variant="outline">
            <Link to={`/crm/leads/${lead.id}/edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium text-foreground">{lead.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{lead.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interested project</p>
            <p className="font-medium text-foreground">{lead.interested_project_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Referred by</p>
            <p className="font-medium text-foreground">{lead.referred_by_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Assigned to</p>
            <p className="font-medium text-foreground">{lead.assigned_to_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Organization</p>
            <p className="font-medium text-foreground">{lead.organization_name || '—'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
