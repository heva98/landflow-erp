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
import { useCustomersQuery } from '@/features/crm/hooks/use-customers'

import { useCreateReservationMutation } from '../hooks/use-reservations'

const reserveFormSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  reservation_fee: z.number().positive('Reservation fee must be greater than 0'),
  expiry_date: z.string().min(1, 'Expiry date is required'),
})

type ReserveFormValues = z.infer<typeof reserveFormSchema>

interface ReservePlotDialogProps {
  plotId: string
  plotNumber: string
}

export function ReservePlotDialog({ plotId, plotNumber }: ReservePlotDialogProps) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { data: customers } = useCustomersQuery()
  const createReservation = useCreateReservationMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReserveFormValues>({
    resolver: zodResolver(reserveFormSchema),
  })

  async function submit(values: ReserveFormValues) {
    setFormError(null)
    try {
      await createReservation.mutateAsync({
        plot: plotId,
        customer: values.customer,
        reservation_fee: values.reservation_fee,
        expiry_date: values.expiry_date,
      })
      setOpen(false)
      reset()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        setFormError(error.response.data?.detail ?? 'This plot cannot be reserved.')
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
        <Button>Reserve</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reserve plot {plotNumber}</DialogTitle>
          <DialogDescription>Hold this plot for a customer until the expiry date.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer">Customer</Label>
            <Controller
              control={control}
              name="customer"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="customer" aria-invalid={Boolean(errors.customer)}>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.results.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customer && <p className="text-sm text-destructive">{errors.customer.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reservation_fee">Reservation fee (TZS)</Label>
            <Input
              id="reservation_fee"
              type="number"
              step="0.01"
              min="0"
              aria-invalid={Boolean(errors.reservation_fee)}
              {...register('reservation_fee', { valueAsNumber: true })}
            />
            {errors.reservation_fee && <p className="text-sm text-destructive">{errors.reservation_fee.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expiry_date">Expiry date</Label>
            <Input
              id="expiry_date"
              type="datetime-local"
              aria-invalid={Boolean(errors.expiry_date)}
              {...register('expiry_date')}
            />
            {errors.expiry_date && <p className="text-sm text-destructive">{errors.expiry_date.message}</p>}
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Reserve plot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
