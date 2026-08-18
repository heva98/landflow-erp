import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useCurrenciesQuery, useSettingsQuery, useUpdateSettingsMutation } from '../hooks/use-administration'
import { canManageSettings } from '../lib/permissions'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const settingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(255),
  company_address: z.string().max(255).optional(),
  company_phone: z.string().max(30).optional(),
  company_email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  base_currency: z.string().optional(),
  date_format: z.string().max(20),
  timezone: z.string().max(50),
  fiscal_year_start_month: z.number().int().min(1).max(12),
})
type SettingsValues = z.infer<typeof settingsSchema>

export function SettingsTab() {
  const { user } = useAuth()
  const canManage = canManageSettings(user?.permissions)
  const { data, isLoading } = useSettingsQuery()
  const { data: currencies } = useCurrenciesQuery()
  const updateSettings = useUpdateSettingsMutation()
  const [saved, setSaved] = useState(false)

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    if (!data) return
    reset({
      company_name: data.company_name,
      company_address: data.company_address,
      company_phone: data.company_phone,
      company_email: data.company_email,
      base_currency: data.base_currency ?? '',
      date_format: data.date_format,
      timezone: data.timezone,
      fiscal_year_start_month: data.fiscal_year_start_month,
    })
  }, [data, reset])

  async function submit(values: SettingsValues) {
    setSaved(false)
    await updateSettings.mutateAsync({ ...values, base_currency: values.base_currency || null })
    setSaved(true)
  }

  if (isLoading) return <p className="text-center text-sm text-muted-foreground">Loading…</p>

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex max-w-2xl flex-col gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company_name">Company name</Label>
        <Input id="company_name" disabled={!canManage} aria-invalid={Boolean(errors.company_name)} {...register('company_name')} />
        {errors.company_name && <p className="text-sm text-destructive">{errors.company_name.message}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company_address">Address</Label>
        <Input id="company_address" disabled={!canManage} {...register('company_address')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company_phone">Phone</Label>
          <Input id="company_phone" disabled={!canManage} {...register('company_phone')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company_email">Email</Label>
          <Input
            id="company_email"
            type="email"
            disabled={!canManage}
            aria-invalid={Boolean(errors.company_email)}
            {...register('company_email')}
          />
          {errors.company_email && <p className="text-sm text-destructive">{errors.company_email.message}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Base currency</Label>
        <Controller
          control={control}
          name="base_currency"
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={!canManage}>
              <SelectTrigger>
                <SelectValue placeholder="No base currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies?.results.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    {currency.code} — {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_format">Date format</Label>
          <Input id="date_format" disabled={!canManage} {...register('date_format')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" disabled={!canManage} {...register('timezone')} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Fiscal year start month</Label>
        <Controller
          control={control}
          name="fiscal_year_start_month"
          render={({ field }) => (
            <Select
              value={String(field.value)}
              onValueChange={(value) => field.onChange(Number(value))}
              disabled={!canManage}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={month} value={String(index + 1)}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {canManage && (
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Save settings
          </Button>
          {saved && <p className="text-sm text-accent">Saved.</p>}
        </div>
      )}
    </form>
  )
}
