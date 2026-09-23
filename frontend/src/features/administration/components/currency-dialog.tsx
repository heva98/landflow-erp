import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

import { useCreateCurrencyMutation, useUpdateCurrencyMutation } from '../hooks/use-administration'
import type { Currency } from '../types'

const currencySchema = z.object({
  code: z.string().min(3, 'Use the 3-letter ISO code').max(3, 'Use the 3-letter ISO code').transform((v) => v.toUpperCase()),
  name: z.string().min(1, 'Name is required').max(100),
  symbol: z.string().max(8).optional(),
  exchange_rate: z.number().positive('Must be greater than zero'),
  is_base: z.boolean().optional(),
  is_active: z.boolean().optional(),
})
type CurrencyValues = z.infer<typeof currencySchema>

export function CurrencyDialog({ currency }: { currency?: Currency }) {
  const [open, setOpen] = useState(false)
  const createCurrency = useCreateCurrencyMutation()
  const updateCurrency = useUpdateCurrencyMutation(currency?.id ?? '')

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CurrencyValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      code: currency?.code ?? '',
      name: currency?.name ?? '',
      symbol: currency?.symbol ?? '',
      exchange_rate: currency ? Number(currency.exchange_rate) : 1,
      is_base: currency?.is_base ?? false,
      is_active: currency?.is_active ?? true,
    },
  })

  async function submit(values: CurrencyValues) {
    const input = { ...values, symbol: values.symbol ?? '' }
    if (currency) {
      await updateCurrency.mutateAsync(input)
    } else {
      await createCurrency.mutateAsync(input)
    }
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {currency ? (
          <Button size="icon" variant="ghost" aria-label="Edit currency">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> New currency
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currency ? 'Edit currency' : 'New currency'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="code">Code</Label>
              <Input id="code" placeholder="TZS" maxLength={3} aria-invalid={Boolean(errors.code)} {...register('code')} />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="symbol">Symbol</Label>
              <Input id="symbol" placeholder="TSh" {...register('symbol')} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exchange_rate">Exchange rate (per 1 base unit)</Label>
            <Input
              id="exchange_rate"
              type="number"
              step="0.000001"
              aria-invalid={Boolean(errors.exchange_rate)}
              {...register('exchange_rate', { valueAsNumber: true })}
            />
            {errors.exchange_rate && <p className="text-sm text-destructive">{errors.exchange_rate.message}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="is_base"
              render={({ field }) => <Checkbox id="is_base" checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label htmlFor="is_base" className="font-normal">Base currency</Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => <Checkbox id="is_active" checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label htmlFor="is_active" className="font-normal">Active</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {currency ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
