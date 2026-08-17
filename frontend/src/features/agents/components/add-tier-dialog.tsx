import { zodResolver } from '@hookform/resolvers/zod'
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

import { useCreateCommissionTierMutation } from '../hooks/use-agents'

const tierSchema = z.object({
  min_amount: z.number().nonnegative('Must be zero or more'),
  max_amount: z.number().positive('Must be greater than 0').optional(),
  rate_percent: z.number().nonnegative('Must be zero or more'),
})
type TierValues = z.infer<typeof tierSchema>

export function AddTierDialog({ planId }: { planId: string }) {
  const [open, setOpen] = useState(false)
  const createTier = useCreateCommissionTierMutation()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TierValues>({
    resolver: zodResolver(tierSchema),
  })

  async function submit(values: TierValues) {
    await createTier.mutateAsync({ plan: planId, ...values, max_amount: values.max_amount ?? null })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add tier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add commission tier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="min_amount">Min sale amount (TZS)</Label>
            <Input
              id="min_amount"
              type="number"
              step="0.01"
              min="0"
              aria-invalid={Boolean(errors.min_amount)}
              {...register('min_amount', { valueAsNumber: true })}
            />
            {errors.min_amount && <p className="text-sm text-destructive">{errors.min_amount.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="max_amount">Max sale amount (TZS, leave blank for no upper bound)</Label>
            <Input id="max_amount" type="number" step="0.01" min="0" {...register('max_amount', { valueAsNumber: true })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rate_percent">Rate (%)</Label>
            <Input
              id="rate_percent"
              type="number"
              step="0.01"
              min="0"
              aria-invalid={Boolean(errors.rate_percent)}
              {...register('rate_percent', { valueAsNumber: true })}
            />
            {errors.rate_percent && <p className="text-sm text-destructive">{errors.rate_percent.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Add tier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
