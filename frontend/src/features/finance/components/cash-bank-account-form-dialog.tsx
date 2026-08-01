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

import { useAccountsQuery, useCreateCashBankAccountMutation } from '../hooks/use-finance'
import { CASH_BANK_KIND_LABELS, CASH_BANK_KINDS } from '../types'

const cashBankAccountFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  kind: z.enum(CASH_BANK_KINDS),
  account: z.string().min(1, 'A backing GL account is required'),
  bank_name: z.string().optional(),
  branch: z.string().optional(),
  account_number: z.string().optional(),
  opening_balance: z.number().min(0).optional(),
})

type CashBankAccountFormValues = z.infer<typeof cashBankAccountFormSchema>

export function CashBankAccountFormDialog() {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { data: assetAccounts } = useAccountsQuery({ type: 'asset' })
  const createCashBankAccount = useCreateCashBankAccountMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CashBankAccountFormValues>({
    resolver: zodResolver(cashBankAccountFormSchema),
    defaultValues: { kind: 'cash', opening_balance: 0 },
  })
  const kind = watch('kind')

  async function submit(values: CashBankAccountFormValues) {
    setFormError(null)
    try {
      await createCashBankAccount.mutateAsync({
        ...values,
        bank_name: values.bank_name ?? '',
        branch: values.branch ?? '',
        account_number: values.account_number ?? '',
        opening_balance: values.opening_balance ?? 0,
      })
      setOpen(false)
      reset()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        const detail = error.response.data
        const message =
          typeof detail === 'object' && detail
            ? Object.values(detail).flat().join(' ')
            : 'This account could not be created.'
        setFormError(message || 'This account could not be created.')
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
          <Plus /> New cash / bank account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New cash / bank account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kind">Kind</Label>
              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="kind">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CASH_BANK_KINDS.map((value) => (
                        <SelectItem key={value} value={value}>
                          {CASH_BANK_KIND_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account">Backing GL account (Asset)</Label>
            <Controller
              control={control}
              name="account"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="account" aria-invalid={Boolean(errors.account)}>
                    <SelectValue placeholder="Select an asset account" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetAccounts?.results.map((account) => (
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

          {kind === 'bank' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bank_name">Bank name</Label>
                <Input id="bank_name" {...register('bank_name')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" {...register('branch')} />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="account_number">Account number</Label>
                <Input id="account_number" {...register('account_number')} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="opening_balance">Opening balance (TZS)</Label>
            <Input
              id="opening_balance"
              type="number"
              step="0.01"
              min="0"
              {...register('opening_balance', { valueAsNumber: true })}
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Create account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
