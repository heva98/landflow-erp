import { useNavigate, useParams } from 'react-router-dom'

import { LeadForm } from '../components/lead-form'
import { useLeadQuery, useUpdateLeadMutation } from '../hooks/use-leads'

export function LeadEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: lead, isLoading } = useLeadQuery(id)
  const updateLead = useUpdateLeadMutation(id as string)

  if (isLoading || !lead) {
    return <p className="text-muted-foreground">Loading lead…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Edit {lead.full_name}</h1>
      <LeadForm
        submitLabel="Save changes"
        defaultValues={{
          full_name: lead.full_name,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          status: lead.status,
          interested_project: lead.interested_project ?? 'none',
          referred_by: lead.referred_by ?? 'none',
        }}
        onSubmit={async (input) => {
          await updateLead.mutateAsync(input)
          navigate(`/crm/leads/${lead.id}`)
        }}
      />
    </div>
  )
}
