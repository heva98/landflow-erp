import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { LeadForm, type LeadFormValues } from './lead-form'
import { useCreateLeadMutation, useUpdateLeadMutation } from '../hooks/use-leads'
import type { Lead } from '../types'

interface LeadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead
  draft?: Partial<LeadFormValues>
  onSaved?: (lead: Lead) => void
}

export function LeadFormDialog({ open, onOpenChange, lead, draft, onSaved }: LeadFormDialogProps) {
  const isEdit = Boolean(lead)
  const createLead = useCreateLeadMutation()
  const updateLead = useUpdateLeadMutation(lead?.id ?? '')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit lead' : 'Create lead'}</DialogTitle>
          <DialogDescription>
            {isEdit ? `Update ${lead!.full_name}'s details.` : 'Add a new lead to the pipeline.'}
          </DialogDescription>
        </DialogHeader>

        <LeadForm
          submitLabel={isEdit ? 'Save changes' : 'Create lead'}
          onCancel={() => onOpenChange(false)}
          defaultValues={
            isEdit
              ? {
                  full_name: lead!.full_name,
                  phone: lead!.phone,
                  email: lead!.email,
                  source: lead!.source,
                  status: lead!.status,
                  lost_reason: lead!.lost_reason,
                  interested_project: lead!.interested_project ?? 'none',
                  referred_by: lead!.referred_by ?? 'none',
                  assigned_to: lead!.assigned_to ?? 'none',
                }
              : draft
          }
          footerExtra={
            isEdit ? (
              <Link
                to={`/crm/leads/${lead!.id}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View full details <ExternalLink className="size-3.5" />
              </Link>
            ) : undefined
          }
          onSubmit={async (input) => {
            const saved = isEdit ? await updateLead.mutateAsync(input) : await createLead.mutateAsync(input)
            onOpenChange(false)
            onSaved?.(saved)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
