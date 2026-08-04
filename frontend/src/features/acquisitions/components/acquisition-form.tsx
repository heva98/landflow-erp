import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { AcquisitionInput } from '../types'

const acquisitionFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  location: z.string().min(1, 'Location is required').max(255),
  region: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  latitude: z.union([z.number(), z.nan()]).optional(),
  longitude: z.union([z.number(), z.nan()]).optional(),
  area_sqm: z.number().positive('Area must be greater than 0'),
  description: z.string().max(2000).optional(),
  ownership_verified: z.boolean(),
  legal_checks_passed: z.boolean(),
  due_diligence_notes: z.string().max(2000).optional(),
  valuation_amount: z.number().nonnegative('Must be zero or more'),
  valuation_date: z.string().optional(),
  valuator_name: z.string().max(255).optional(),
  asking_price: z.number().nonnegative('Must be zero or more'),
  purchase_price: z.number().nonnegative('Must be zero or more'),
  notes: z.string().max(2000).optional(),
})

export type AcquisitionFormValues = z.infer<typeof acquisitionFormSchema>

interface AcquisitionFormProps {
  defaultValues?: Partial<AcquisitionFormValues>
  submitLabel: string
  onSubmit: (input: AcquisitionInput) => Promise<unknown>
}

export function AcquisitionForm({ defaultValues, submitLabel, onSubmit }: AcquisitionFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcquisitionFormValues>({
    resolver: zodResolver(acquisitionFormSchema),
    defaultValues: {
      ownership_verified: false,
      legal_checks_passed: false,
      valuation_amount: 0,
      asking_price: 0,
      purchase_price: 0,
      ...defaultValues,
    },
  })

  async function submit(values: AcquisitionFormValues) {
    setFormError(null)
    try {
      await onSubmit({
        name: values.name,
        location: values.location,
        region: values.region ?? '',
        district: values.district ?? '',
        latitude: Number.isFinite(values.latitude) ? (values.latitude as number) : null,
        longitude: Number.isFinite(values.longitude) ? (values.longitude as number) : null,
        area_sqm: values.area_sqm,
        description: values.description ?? '',
        ownership_verified: values.ownership_verified,
        legal_checks_passed: values.legal_checks_passed,
        due_diligence_notes: values.due_diligence_notes ?? '',
        valuation_amount: values.valuation_amount,
        valuation_date: values.valuation_date || null,
        valuator_name: values.valuator_name ?? '',
        asking_price: values.asking_price,
        purchase_price: values.purchase_price,
        notes: values.notes ?? '',
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
    <form onSubmit={handleSubmit(submit)} className="flex max-w-3xl flex-col gap-6" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">Parcel name</Label>
          <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" aria-invalid={Boolean(errors.location)} {...register('location')} />
          {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="region">Region</Label>
          <Input id="region" {...register('region')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="district">District</Label>
          <Input id="district" {...register('district')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" type="number" step="any" {...register('latitude', { valueAsNumber: true })} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" type="number" step="any" {...register('longitude', { valueAsNumber: true })} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="area_sqm">Area (sqm)</Label>
          <Input
            id="area_sqm"
            type="number"
            step="0.01"
            min="0"
            aria-invalid={Boolean(errors.area_sqm)}
            {...register('area_sqm', { valueAsNumber: true })}
          />
          {errors.area_sqm && <p className="text-sm text-destructive">{errors.area_sqm.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...register('description')} />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <h3 className="text-sm font-semibold text-foreground">Due diligence &amp; legal</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <Controller
            control={control}
            name="ownership_verified"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                Ownership verified
              </label>
            )}
          />
          <Controller
            control={control}
            name="legal_checks_passed"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                Legal checks passed
              </label>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="due_diligence_notes">Due diligence notes</Label>
          <Textarea id="due_diligence_notes" rows={3} {...register('due_diligence_notes')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2">
        <h3 className="text-sm font-semibold text-foreground sm:col-span-2">Valuation</h3>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="valuation_amount">Valuation amount (TZS)</Label>
          <Input
            id="valuation_amount"
            type="number"
            step="0.01"
            min="0"
            {...register('valuation_amount', { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="valuation_date">Valuation date</Label>
          <Input id="valuation_date" type="date" {...register('valuation_date')} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="valuator_name">Valuator</Label>
          <Input id="valuator_name" {...register('valuator_name')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2">
        <h3 className="text-sm font-semibold text-foreground sm:col-span-2">Pricing</h3>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="asking_price">Asking price (TZS)</Label>
          <Input
            id="asking_price"
            type="number"
            step="0.01"
            min="0"
            {...register('asking_price', { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="purchase_price">Agreed purchase price (TZS)</Label>
          <Input
            id="purchase_price"
            type="number"
            step="0.01"
            min="0"
            {...register('purchase_price', { valueAsNumber: true })}
          />
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
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
