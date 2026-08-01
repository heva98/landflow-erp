import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useSalesQuery } from '@/features/sales/hooks/use-sales'
import { formatTZS } from '@/lib/utils'

import { useCreatePaymentPlanMutation } from '../hooks/use-installments'
import type { PaymentPlan } from '../types'

const paymentPlanFormSchema = z.object({
  sale: z.string().min(1, 'Sale is required'),
  number_of_installments: z.number().int().min(1, 'Must be at least 1 installment'),
  interest_rate: z.number().min(0).max(100).optional(),
  start_date: z.string().min(1, 'Start date is required'),
  grace_period_days: z.number().int().min(0).optional(),
  penalty_rate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
})

type PaymentPlanFormValues = z.infer<typeof paymentPlanFormSchema>

interface PaymentPlanFormProps {
  initialSaleId?: string
  onSuccess: (plan: PaymentPlan) => void
}

export function PaymentPlanForm({ initialSaleId, onSuccess }: PaymentPlanFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const { data: sales } = useSalesQuery({ sale_type: 'installment', status: 'active' })
  const createPaymentPlan = useCreatePaymentPlanMutation()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentPlanFormValues>({
    resolver: zodResolver(paymentPlanFormSchema),
    defaultValues: { sale: initialSaleId, interest_rate: 0, grace_period_days: 0, penalty_rate: 0 },
  })

  async function submit(values: PaymentPlanFormValues) {
    setFormError(null)
    try {
      const plan = await createPaymentPlan.mutateAsync({
        sale: values.sale,
        number_of_installments: values.number_of_installments,
        interest_rate: values.interest_rate ?? 0,
        start_date: values.start_date,
        grace_period_days: values.grace_period_days ?? 0,
        penalty_rate: values.penalty_rate ?? 0,
        notes: values.notes ?? '',
      })
      onSuccess(plan)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        const detail = error.response.data
        const message =
          typeof detail === 'object' && detail ? Object.values(detail).flat().join(' ') : 'This payment plan could not be created.'
        setFormError(message || 'This payment plan could not be created.')
      } else if (isAxiosError(error) && error.response?.status === 403) {
        setFormError("You don't have permission to do that.")
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-w-2xl flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sale">Installment sale</Label>
        <Controller
          control={control}
          name="sale"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(initialSaleId)}>
              <SelectTrigger id="sale" aria-invalid={Boolean(errors.sale)}>
                <SelectValue placeholder="Select an installment sale" />
              </SelectTrigger>
              <SelectContent>
                {sales?.results.map((sale) => (
                  <SelectItem key={sale.id} value={sale.id}>
                    {sale.sale_number} · {sale.customer_name} · {formatTZS(sale.balance_due)} due
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.sale && <p className="text-sm text-destructive">{errors.sale.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="number_of_installments">Number of monthly installments</Label>
          <Input
            id="number_of_installments"
            type="number"
            min="1"
            step="1"
            aria-invalid={Boolean(errors.number_of_installments)}
            {...register('number_of_installments', { valueAsNumber: true })}
          />
          {errors.number_of_installments && (
            <p className="text-sm text-destructive">{errors.number_of_installments.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">First installment due date</Label>
          <Input
            id="start_date"
            type="date"
            aria-invalid={Boolean(errors.start_date)}
            {...register('start_date')}
          />
          {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="interest_rate">Interest rate (%)</Label>
          <Input
            id="interest_rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            aria-invalid={Boolean(errors.interest_rate)}
            {...register('interest_rate', { valueAsNumber: true })}
          />
          {errors.interest_rate && <p className="text-sm text-destructive">{errors.interest_rate.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grace_period_days">Grace period (days)</Label>
          <Input
            id="grace_period_days"
            type="number"
            step="1"
            min="0"
            aria-invalid={Boolean(errors.grace_period_days)}
            {...register('grace_period_days', { valueAsNumber: true })}
          />
          {errors.grace_period_days && <p className="text-sm text-destructive">{errors.grace_period_days.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="penalty_rate">Late penalty (% of installment)</Label>
          <Input
            id="penalty_rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            aria-invalid={Boolean(errors.penalty_rate)}
            {...register('penalty_rate', { valueAsNumber: true })}
          />
          {errors.penalty_rate && <p className="text-sm text-destructive">{errors.penalty_rate.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...register('notes')} />
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Create payment plan
        </Button>
      </div>
    </form>
  )
}
