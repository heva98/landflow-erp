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
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useUsersQuery } from '../hooks/use-users'
import { canViewProjectFinancials } from '../lib/permissions'
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, type ProjectInput } from '../types'

const UNASSIGNED = 'unassigned'

const projectFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  status: z.enum(PROJECT_STATUSES),
  location: z.string().min(1, 'Location is required').max(255),
  description: z.string().max(2000).optional(),
  owner_id: z.string().optional(),
  master_plan_url: z.union([z.string().url('Enter a valid URL'), z.literal('')]).optional(),
  total_area_sqm: z.number().positive('Area must be greater than 0'),
  acquisition_cost: z.number().nonnegative('Must be zero or more'),
  development_cost: z.number().nonnegative('Must be zero or more'),
  expected_revenue: z.number().nonnegative('Must be zero or more'),
  start_date: z.string().optional(),
  expected_completion_date: z.string().optional(),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>
  submitLabel: string
  onSubmit: (input: ProjectInput) => Promise<unknown>
}

export function ProjectForm({ defaultValues, submitLabel, onSubmit }: ProjectFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const { data: users, isError: usersError } = useUsersQuery()
  const { user } = useAuth()
  const canViewFinancials = canViewProjectFinancials(user?.permissions)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      status: 'planning',
      acquisition_cost: 0,
      development_cost: 0,
      expected_revenue: 0,
      ...defaultValues,
    },
  })

  async function submit(values: ProjectFormValues) {
    setFormError(null)
    try {
      await onSubmit({
        name: values.name,
        status: values.status,
        location: values.location,
        description: values.description ?? '',
        owner_id: values.owner_id || null,
        master_plan_url: values.master_plan_url ?? '',
        total_area_sqm: values.total_area_sqm,
        acquisition_cost: values.acquisition_cost,
        development_cost: values.development_cost,
        expected_revenue: values.expected_revenue,
        start_date: values.start_date || null,
        expected_completion_date: values.expected_completion_date || null,
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
          <Label htmlFor="name">Project name</Label>
          <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
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
                  {PROJECT_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PROJECT_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="owner_id">Owner</Label>
          <Controller
            control={control}
            name="owner_id"
            render={({ field }) => (
              <Select
                value={field.value || UNASSIGNED}
                onValueChange={(value) => field.onChange(value === UNASSIGNED ? '' : value)}
                disabled={usersError}
              >
                <SelectTrigger id="owner_id">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {usersError && (
            <p className="text-xs text-muted-foreground">
              You don't have access to the user directory, so you can't reassign the owner.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" aria-invalid={Boolean(errors.location)} {...register('location')} />
          {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="total_area_sqm">Total area (sqm)</Label>
          <Input
            id="total_area_sqm"
            type="number"
            step="0.01"
            min="0"
            aria-invalid={Boolean(errors.total_area_sqm)}
            {...register('total_area_sqm', { valueAsNumber: true })}
          />
          {errors.total_area_sqm && <p className="text-sm text-destructive">{errors.total_area_sqm.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="master_plan_url">Master plan URL</Label>
          <Input
            id="master_plan_url"
            type="url"
            placeholder="https://…"
            aria-invalid={Boolean(errors.master_plan_url)}
            {...register('master_plan_url')}
          />
          {errors.master_plan_url && <p className="text-sm text-destructive">{errors.master_plan_url.message}</p>}
        </div>

        {canViewFinancials && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acquisition_cost">Acquisition cost (TZS)</Label>
              <Input
                id="acquisition_cost"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={Boolean(errors.acquisition_cost)}
                {...register('acquisition_cost', { valueAsNumber: true })}
              />
              {errors.acquisition_cost && (
                <p className="text-sm text-destructive">{errors.acquisition_cost.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="development_cost">Development cost (TZS)</Label>
              <Input
                id="development_cost"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={Boolean(errors.development_cost)}
                {...register('development_cost', { valueAsNumber: true })}
              />
              {errors.development_cost && (
                <p className="text-sm text-destructive">{errors.development_cost.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expected_revenue">Expected revenue (TZS)</Label>
              <Input
                id="expected_revenue"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={Boolean(errors.expected_revenue)}
                {...register('expected_revenue', { valueAsNumber: true })}
              />
              {errors.expected_revenue && (
                <p className="text-sm text-destructive">{errors.expected_revenue.message}</p>
              )}
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" type="date" {...register('start_date')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expected_completion_date">Expected completion</Label>
          <Input id="expected_completion_date" type="date" {...register('expected_completion_date')} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} {...register('description')} />
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
