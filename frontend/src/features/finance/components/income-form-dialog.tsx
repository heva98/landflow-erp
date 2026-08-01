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
import { Textarea } from '@/components/ui/textarea'

import { useAccountsQuery, useCashBankAccountsQuery, useCreateIncomeMutation } from '../hooks/use-finance'

const incomeFormSchema = z.object({
  account: z.string().min(1, 'Income account is required'),
  deposit_to: z.string().min(1, 'Deposit account is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
})

type IncomeFormValues = z.infer<typeof incomeFormSchema>

export function IncomeFormDialog() {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { data: incomeAccounts } = useAccountsQuery({ type: 'income' })
  const { data: cashBankAccounts } = useCashBankAccountsQuery()
  const createIncome = useCreateIncomeMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  })

  async function submit(values: IncomeFormValues) {
    setFormError(null)
    try {
      await createIncome.mutateAsync({ ...values, description: values.description ?? '' })
      setOpen(false)
      reset()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        const detail = error.response.data
        const message =
          typeof detail === 'object' && detail ? Object.values(detail).flat().join(' ') : 'This income could not be recorded.'
        setFormError(message || 'This income could not be recorded.')
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
        <Button size="sm">
          <Plus /> Record income
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record income</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account">Income account</Label>
            <Controller
              control={control}
              name="account"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="account" aria-invalid={Boolean(errors.account)}>
                    <SelectValue placeholder="Select an income account" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeAccounts?.results.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.account && <p className="text-sm text-destructive">{errors.account.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deposit_to">Deposit to</Label>
            <Controller
              control={control}
              name="deposit_to"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="deposit_to" aria-invalid={Boolean(errors.deposit_to)}>
                    <SelectValue placeholder="Select a cash / bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashBankAccounts?.results.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.deposit_to && <p className="text-sm text-destructive">{errors.deposit_to.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" aria-invalid={Boolean(errors.date)} {...register('date')} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register('description')} />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Record income
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
