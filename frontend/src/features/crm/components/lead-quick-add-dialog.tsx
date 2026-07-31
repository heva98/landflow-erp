import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useCreateLeadMutation } from '../hooks/use-leads'
import { LEAD_SOURCE_LABELS, LEAD_SOURCES, type Lead } from '../types'

const quickAddSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255),
  phone: z.string().min(1, 'Phone is required').max(30),
  source: z.enum(LEAD_SOURCES),
})

export type QuickAddValues = z.infer<typeof quickAddSchema>

interface LeadQuickAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (lead: Lead) => void
  onSwitchToFull: (draft: QuickAddValues) => void
}

export function LeadQuickAddDialog({ open, onOpenChange, onCreated, onSwitchToFull }: LeadQuickAddDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const createLead = useCreateLeadMutation()

  const {
    register,
    control,
    getValues,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickAddValues>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: { full_name: '', phone: '', source: 'walk_in' },
  })

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function submit(values: QuickAddValues) {
    setFormError(null)
    try {
      const lead = await createLead.mutateAsync({
        full_name: values.full_name,
        phone: values.phone,
        email: '',
        source: values.source,
        status: 'new',
        lost_reason: '',
        interested_project: null,
        referred_by: null,
        assigned_to: null,
      })
      reset()
      onOpenChange(false)
      onCreated?.(lead)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setFormError("You don't have permission to do that.")
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Quick add lead</DialogTitle>
          <DialogDescription>Capture a walk-in in seconds.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qa-full_name">Full name</Label>
            <Input
              id="qa-full_name"
              placeholder="e.g. Julius Mwakyusa"
              aria-invalid={Boolean(errors.full_name)}
              {...register('full_name')}
            />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qa-phone">Phone</Label>
            <Input
              id="qa-phone"
              placeholder="+255 7XX XXX XXX"
              aria-invalid={Boolean(errors.phone)}
              {...register('phone')}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qa-source">Source</Label>
            <Controller
              control={control}
              name="source"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="qa-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {LEAD_SOURCE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter className="items-center sm:justify-between">
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 text-sm"
              onClick={() => onSwitchToFull(getValues())}
            >
              Need more detail? Switch to full form →
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Add lead
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
