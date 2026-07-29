import { useNavigate } from 'react-router-dom'

import { LeadForm } from '../components/lead-form'
import { useCreateLeadMutation } from '../hooks/use-leads'

export function LeadCreatePage() {
  const navigate = useNavigate()
  const createLead = useCreateLeadMutation()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">New lead</h1>
      <LeadForm
        submitLabel="Create lead"
        onSubmit={async (input) => {
          const lead = await createLead.mutateAsync(input)
          navigate(`/crm/leads/${lead.id}`)
        }}
      />
    </div>
  )
}
