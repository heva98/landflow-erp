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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatTZS } from '@/lib/utils'

import { useCreateInstallmentPaymentMutation } from '../hooks/use-installments'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, type Installment } from '../types'

const recordPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().max(100).optional(),
  notes: z.string().optional(),
})

type RecordPaymentValues = z.infer<typeof recordPaymentSchema>

interface RecordPaymentDialogProps {
  paymentPlanId: string
  installment: Installment
}

export function RecordPaymentDialog({ paymentPlanId, installment }: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const recordPayment = useCreateInstallmentPaymentMutation(paymentPlanId)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordPaymentValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: { amount: Number(installment.balance) },
  })

  async function submit(values: RecordPaymentValues) {
    setFormError(null)
    try {
      await recordPayment.mutateAsync({
        installment: installment.id,
        amount: values.amount,
        method: values.method,
        reference: values.reference ?? '',
        notes: values.notes ?? '',
      })
      setOpen(false)
      reset()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        const detail = error.response.data
        const message =
          typeof detail === 'object' && detail ? Object.values(detail).flat().join(' ') : 'This payment could not be recorded.'
        setFormError(message || 'This payment could not be recorded.')
      } else if (isAxiosError(error) && error.response?.status === 403) {
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
          Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment — installment #{installment.sequence}</DialogTitle>
          <DialogDescription>Outstanding balance: {formatTZS(installment.balance)}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
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
            <Label htmlFor="method">Payment method</Label>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="method" aria-invalid={Boolean(errors.method)}>
                    <SelectValue placeholder="How was this payment received?" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PAYMENT_METHOD_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.method && <p className="text-sm text-destructive">{errors.method.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reference">Payment reference</Label>
            <Input id="reference" placeholder="Transaction / cheque number" {...register('reference')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...register('notes')} />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Record payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
