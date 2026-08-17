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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useCreateCommissionPlanMutation } from '../hooks/use-agents'
import { COMMISSION_PLAN_TYPE_LABELS, COMMISSION_PLAN_TYPES } from '../types'

const planSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  plan_type: z.enum(COMMISSION_PLAN_TYPES),
  rate_percent: z.number().nonnegative().optional(),
  flat_amount: z.number().nonnegative().optional(),
  description: z.string().max(2000).optional(),
})
type PlanValues = z.infer<typeof planSchema>

export function CommissionPlanDialog() {
  const [open, setOpen] = useState(false)
  const createPlan = useCreateCommissionPlanMutation()

  const { control, register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } =
    useForm<PlanValues>({ resolver: zodResolver(planSchema), defaultValues: { plan_type: 'percentage' } })
  const planType = watch('plan_type')

  async function submit(values: PlanValues) {
    await createPlan.mutateAsync({
      name: values.name,
      plan_type: values.plan_type,
      rate_percent: values.plan_type === 'percentage' ? values.rate_percent ?? 0 : null,
      flat_amount: values.plan_type === 'flat' ? values.flat_amount ?? 0 : null,
      description: values.description ?? '',
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New commission plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New commission plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan_type">Type</Label>
            <Controller
              control={control}
              name="plan_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="plan_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMISSION_PLAN_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {COMMISSION_PLAN_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {planType === 'percentage' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate_percent">Rate (%)</Label>
              <Input
                id="rate_percent"
                type="number"
                step="0.01"
                min="0"
                {...register('rate_percent', { valueAsNumber: true })}
              />
            </div>
          )}
          {planType === 'flat' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="flat_amount">Flat amount (TZS)</Label>
              <Input
                id="flat_amount"
                type="number"
                step="0.01"
                min="0"
                {...register('flat_amount', { valueAsNumber: true })}
              />
            </div>
          )}
          {planType === 'tiered' && (
            <p className="text-sm text-muted-foreground">
              Add tiers (min/max sale amount and rate) after creating the plan.
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
