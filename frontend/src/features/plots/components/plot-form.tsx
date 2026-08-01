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
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'

import { canSetPlotFinancials } from '../lib/permissions'
import { PLOT_STATUS_LABELS, PLOT_STATUSES, type PlotInput } from '../types'

const plotFormSchema = z.object({
  project: z.string().min(1, 'Project is required'),
  plot_number: z.string().min(1, 'Plot number is required').max(50),
  block: z.string().max(100).optional(),
  street: z.string().max(100).optional(),
  status: z.enum(PLOT_STATUSES),
  area_sqm: z.number().positive('Area must be greater than 0'),
  price: z.number().nonnegative('Must be zero or more'),
  discount: z.number().nonnegative('Must be zero or more'),
  google_maps_url: z.union([z.string().url('Enter a valid URL'), z.literal('')]).optional(),
})

export type PlotFormValues = z.infer<typeof plotFormSchema>

interface PlotFormProps {
  defaultValues?: Partial<PlotFormValues>
  submitLabel: string
  onSubmit: (input: PlotInput) => Promise<unknown>
}

export function PlotForm({ defaultValues, submitLabel, onSubmit }: PlotFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const { user } = useAuth()
  const canSetFinancials = canSetPlotFinancials(user?.permissions)
  const { data: projects } = useProjectsQuery()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlotFormValues>({
    resolver: zodResolver(plotFormSchema),
    defaultValues: {
      status: 'available',
      price: 0,
      discount: 0,
      ...defaultValues,
    },
  })

  async function submit(values: PlotFormValues) {
    setFormError(null)
    try {
      await onSubmit({
        project: values.project,
        plot_number: values.plot_number,
        block: values.block ?? '',
        street: values.street ?? '',
        status: values.status,
        area_sqm: values.area_sqm,
        price: values.price,
        discount: values.discount,
        google_maps_url: values.google_maps_url ?? '',
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
          <Label htmlFor="project">Project</Label>
          <Controller
            control={control}
            name="project"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="project" aria-invalid={Boolean(errors.project)}>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.results.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.project && <p className="text-sm text-destructive">{errors.project.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plot_number">Plot number</Label>
          <Input id="plot_number" aria-invalid={Boolean(errors.plot_number)} {...register('plot_number')} />
          {errors.plot_number && <p className="text-sm text-destructive">{errors.plot_number.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="block">Block</Label>
          <Input id="block" {...register('block')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="street">Street</Label>
          <Input id="street" {...register('street')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLOT_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PLOT_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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

        {canSetFinancials && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price (TZS)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={Boolean(errors.price)}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
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
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="google_maps_url">Google Maps URL</Label>
          <Input
            id="google_maps_url"
            type="url"
            placeholder="https://…"
            aria-invalid={Boolean(errors.google_maps_url)}
            {...register('google_maps_url')}
          />
          {errors.google_maps_url && <p className="text-sm text-destructive">{errors.google_maps_url.message}</p>}
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
