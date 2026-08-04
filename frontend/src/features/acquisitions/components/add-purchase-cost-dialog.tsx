import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useCreatePurchaseCostMutation } from '../hooks/use-acquisitions'
import { COST_TYPE_LABELS, COST_TYPES } from '../types'

const addCostSchema = z.object({
  cost_type: z.enum(COST_TYPES),
  description: z.string().max(255).optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  incurred_on: z.string().min(1, 'Date is required'),
})

type AddCostValues = z.infer<typeof addCostSchema>

export function AddPurchaseCostDialog({ acquisitionId }: { acquisitionId: string }) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const createCost = useCreatePurchaseCostMutation(acquisitionId)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCostValues>({
    resolver: zodResolver(addCostSchema),
    defaultValues: { cost_type: 'legal_fees', incurred_on: new Date().toISOString().slice(0, 10) },
  })

  async function submit(values: AddCostValues) {
    setFormError(null)
    try {
      await createCost.mutateAsync({
        acquisition: acquisitionId,
        cost_type: values.cost_type,
        description: values.description ?? '',
        amount: values.amount,
        incurred_on: values.incurred_on,
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
          <Plus /> Add cost
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add purchase cost</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cost_type">Cost type</Label>
            <Controller
              control={control}
              name="cost_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="cost_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COST_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {COST_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount (TZS)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              aria-invalid={Boolean(errors.amount)}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="incurred_on">Date incurred</Label>
            <Input
              id="incurred_on"
              type="date"
              aria-invalid={Boolean(errors.incurred_on)}
              {...register('incurred_on')}
            />
            {errors.incurred_on && <p className="text-sm text-destructive">{errors.incurred_on.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Add cost
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
