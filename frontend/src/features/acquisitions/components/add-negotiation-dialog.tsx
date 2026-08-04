import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'

import { useCreateNegotiationMutation } from '../hooks/use-acquisitions'

const addNegotiationSchema = z.object({
  negotiated_on: z.string().min(1, 'Date is required'),
  offered_price: z.union([z.number(), z.nan()]).optional(),
  counter_offer_price: z.union([z.number(), z.nan()]).optional(),
  notes: z.string().max(2000).optional(),
})

type AddNegotiationValues = z.infer<typeof addNegotiationSchema>

export function AddNegotiationDialog({ acquisitionId }: { acquisitionId: string }) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const createNegotiation = useCreateNegotiationMutation(acquisitionId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddNegotiationValues>({
    resolver: zodResolver(addNegotiationSchema),
    defaultValues: { negotiated_on: new Date().toISOString().slice(0, 10) },
  })

  async function submit(values: AddNegotiationValues) {
    setFormError(null)
    try {
      await createNegotiation.mutateAsync({
        acquisition: acquisitionId,
        negotiated_on: values.negotiated_on,
        offered_price: Number.isFinite(values.offered_price) ? (values.offered_price as number) : null,
        counter_offer_price: Number.isFinite(values.counter_offer_price)
          ? (values.counter_offer_price as number)
          : null,
        notes: values.notes ?? '',
      })
      setOpen(false)
      reset()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setFormError("You don't have permission to do that.")
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Log negotiation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log negotiation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="negotiated_on">Date</Label>
            <Input
              id="negotiated_on"
              type="date"
              aria-invalid={Boolean(errors.negotiated_on)}
              {...register('negotiated_on')}
            />
            {errors.negotiated_on && <p className="text-sm text-destructive">{errors.negotiated_on.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="offered_price">Offered price (TZS)</Label>
              <Input
                id="offered_price"
                type="number"
                step="0.01"
                min="0"
                {...register('offered_price', { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="counter_offer_price">Counter offer (TZS)</Label>
              <Input
                id="counter_offer_price"
                type="number"
                step="0.01"
                min="0"
                {...register('counter_offer_price', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register('notes')} />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Log negotiation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
