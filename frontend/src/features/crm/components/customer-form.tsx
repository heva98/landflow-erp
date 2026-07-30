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

import { CUSTOMER_TYPE_LABELS, CUSTOMER_TYPES, type CustomerInput } from '../types'

const customerFormSchema = z.object({
  customer_type: z.enum(CUSTOMER_TYPES),
  full_name: z.string().min(1, 'Full name is required').max(255),
  phone: z.string().min(1, 'Phone is required').max(30),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  address: z.string().max(255).optional(),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormValues>
  submitLabel: string
  onSubmit: (input: CustomerInput) => Promise<unknown>
}

export function CustomerForm({ defaultValues, submitLabel, onSubmit }: CustomerFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customer_type: 'individual',
      ...defaultValues,
    },
  })

  async function submit(values: CustomerFormValues) {
    setFormError(null)
    try {
      await onSubmit({
        customer_type: values.customer_type,
        full_name: values.full_name,
        phone: values.phone,
        email: values.email ?? '',
        address: values.address ?? '',
      })
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setFormError("You don't have permission to do that.")
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex max-w-3xl flex-col gap-5" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="customer_type">Type</Label>
          <Controller
            control={control}
            name="customer_type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="customer_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CUSTOMER_TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
          {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" aria-invalid={Boolean(errors.phone)} {...register('phone')} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register('address')} />
        </div>
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
