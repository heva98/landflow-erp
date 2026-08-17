import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useCreateBookingMutation } from '../hooks/use-site-visits'
import { LeadSelect } from './selects'

const addBookingSchema = z.object({
  lead: z.string().min(1, 'Select a lead'),
  guest_count: z.number().int().min(1),
})
type AddBookingValues = z.infer<typeof addBookingSchema>

export function AddBookingDialog({ siteVisitId }: { siteVisitId: string }) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const createBooking = useCreateBookingMutation(siteVisitId)
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddBookingValues>({
    resolver: zodResolver(addBookingSchema),
    defaultValues: { lead: '', guest_count: 1 },
  })

  async function submit(values: AddBookingValues) {
    setFormError(null)
    try {
      await createBooking.mutateAsync({ site_visit: siteVisitId, ...values })
      setOpen(false)
      reset()
    } catch {
      setFormError('Something went wrong — this lead may already be booked for this visit.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Add booking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a lead onto this visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label>Lead</Label>
            <Controller
              control={control}
              name="lead"
              render={({ field }) => <LeadSelect value={field.value} onChange={field.onChange} />}
            />
            {errors.lead && <p className="text-sm text-destructive">{errors.lead.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guest_count">Guests</Label>
            <Input
              id="guest_count"
              type="number"
              min="1"
              {...register('guest_count', { valueAsNumber: true })}
            />
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
