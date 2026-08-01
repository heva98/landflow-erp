import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCustomersQuery } from '@/features/crm/hooks/use-customers'
import { usePlotsQuery } from '@/features/plots/hooks/use-plots'
import { useReservationQuery } from '@/features/reservations/hooks/use-reservations'
import { formatTZS } from '@/lib/utils'

import { useCreateSaleMutation } from '../hooks/use-sales'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, SALE_TYPE_LABELS, SALE_TYPES } from '../types'
import type { Sale } from '../types'

function buildSaleFormSchema(requirePlotAndCustomer: boolean) {
  return z.object({
    plot: requirePlotAndCustomer ? z.string().min(1, 'Plot is required') : z.string().optional(),
    customer: requirePlotAndCustomer ? z.string().min(1, 'Customer is required') : z.string().optional(),
    sale_type: z.enum(SALE_TYPES),
    sale_price: z.number().positive('Sale price must be greater than 0'),
    discount: z.number().nonnegative('Must be zero or more').optional(),
    down_payment: z.number().positive('Down payment must be greater than 0'),
    payment_method: z.enum(PAYMENT_METHODS),
    reference: z.string().max(100).optional(),
    notes: z.string().optional(),
  })
}

type SaleFormValues = z.infer<ReturnType<typeof buildSaleFormSchema>>

interface SaleFormProps {
  reservationId?: string
  initialPlotId?: string
  onSuccess: (sale: Sale) => void
}

export function SaleForm({ reservationId, initialPlotId, onSuccess }: SaleFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const { data: reservation } = useReservationQuery(reservationId)
  const { data: plots } = usePlotsQuery({ status: 'available' })
  const { data: customers } = useCustomersQuery()
  const createSale = useCreateSaleMutation()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(buildSaleFormSchema(!reservationId)),
    defaultValues: { discount: 0, plot: initialPlotId },
  })

  const saleType = useWatch({ control, name: 'sale_type' })
  const salePrice = useWatch({ control, name: 'sale_price' })
  const discount = useWatch({ control, name: 'discount' })
  const isCashSale = saleType === 'cash'

  useEffect(() => {
    if (isCashSale) {
      setValue('down_payment', Math.max((salePrice || 0) - (discount || 0), 0), { shouldValidate: true })
    }
  }, [isCashSale, salePrice, discount, setValue])

  async function submit(values: SaleFormValues) {
    setFormError(null)
    try {
      const sale = await createSale.mutateAsync({
        ...(reservationId
          ? { reservation: reservationId }
          : { plot: values.plot, customer: values.customer }),
        sale_type: values.sale_type,
        sale_price: values.sale_price,
        discount: values.discount ?? 0,
        down_payment: values.down_payment,
        payment_method: values.payment_method,
        reference: values.reference ?? '',
        notes: values.notes ?? '',
      })
      onSuccess(sale)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        const detail = error.response.data
        const message =
          typeof detail === 'object' && detail
            ? Object.values(detail).flat().join(' ')
            : 'This sale could not be created.'
        setFormError(message || 'This sale could not be created.')
      } else if (isAxiosError(error) && error.response?.status === 403) {
        setFormError("You don't have permission to do that.")
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-w-2xl flex-col gap-5" noValidate>
      {reservationId ? (
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <p className="font-medium text-foreground">
            Plot {reservation?.plot_number} for {reservation?.customer_name}
          </p>
          <p className="text-muted-foreground">Converting reservation into a sale.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plot">Plot</Label>
            <Controller
              control={control}
              name="plot"
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger id="plot" aria-invalid={Boolean(errors.plot)}>
                    <SelectValue placeholder="Select an available plot" />
                  </SelectTrigger>
                  <SelectContent>
                    {plots?.results.map((plot) => (
                      <SelectItem key={plot.id} value={plot.id}>
                        {plot.plot_number} · {formatTZS(plot.final_price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.plot && <p className="text-sm text-destructive">{errors.plot.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="customer">Customer</Label>
            <Controller
              control={control}
              name="customer"
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sale_type">Sale type</Label>
          <Controller
            control={control}
            name="sale_type"
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger id="sale_type" aria-invalid={Boolean(errors.sale_type)}>
                  <SelectValue placeholder="Select a sale type" />
                </SelectTrigger>
                <SelectContent>
                  {SALE_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {SALE_TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.sale_type && <p className="text-sm text-destructive">{errors.sale_type.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="payment_method">Payment method</Label>
          <Controller
            control={control}
            name="payment_method"
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger id="payment_method" aria-invalid={Boolean(errors.payment_method)}>
                  <SelectValue placeholder="How was the down payment received?" />
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
          {errors.payment_method && <p className="text-sm text-destructive">{errors.payment_method.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sale_price">Sale price (TZS)</Label>
          <Input
            id="sale_price"
            type="number"
            step="0.01"
            min="0"
            aria-invalid={Boolean(errors.sale_price)}
            {...register('sale_price', { valueAsNumber: true })}
          />
          {errors.sale_price && <p className="text-sm text-destructive">{errors.sale_price.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="discount">Discount (TZS)</Label>
          <Input
            id="discount"
            type="number"
            step="0.01"
            min="0"
            aria-invalid={Boolean(errors.discount)}
            {...register('discount', { valueAsNumber: true })}
          />
          {errors.discount && <p className="text-sm text-destructive">{errors.discount.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="down_payment">Down payment (TZS)</Label>
          <Input
            id="down_payment"
            type="number"
            step="0.01"
            min="0"
            disabled={isCashSale}
            aria-invalid={Boolean(errors.down_payment)}
            {...register('down_payment', { valueAsNumber: true })}
          />
          {errors.down_payment && <p className="text-sm text-destructive">{errors.down_payment.message}</p>}
          <p className="text-xs text-muted-foreground">
            {isCashSale
              ? 'Automatically set to the full sale price for cash sales.'
              : 'Amount received today; any remaining balance is tracked in Installments.'}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reference">Payment reference</Label>
          <Input id="reference" placeholder="Transaction / cheque number" {...register('reference')} />
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
          Create sale
        </Button>
      </div>
    </form>
  )
}
