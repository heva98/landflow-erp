import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUsersQuery } from '@/features/accounts/hooks/use-users'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'

import { useCustomersQuery } from '../hooks/use-customers'
import { LEAD_SOURCE_LABELS, LEAD_SOURCES, LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadInput } from '../types'

const NONE = 'none'

const leadFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255),
  phone: z.string().max(30).optional(),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  source: z.enum(LEAD_SOURCES),
  status: z.enum(LEAD_STATUSES),
  lost_reason: z.string().max(2000).optional(),
  interested_project: z.string().optional(),
  referred_by: z.string().optional(),
  assigned_to: z.string().optional(),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>

interface LeadFormProps {
  defaultValues?: Partial<LeadFormValues>
  submitLabel: string
  onSubmit: (input: LeadInput) => Promise<unknown>
  onCancel?: () => void
  footerExtra?: ReactNode
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

export function LeadForm({ defaultValues, submitLabel, onSubmit, onCancel, footerExtra }: LeadFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const { data: projects } = useProjectsQuery()
  const { data: customers } = useCustomersQuery()
  const { data: users } = useUsersQuery()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      source: 'website',
      status: 'new',
      interested_project: NONE,
      referred_by: NONE,
      assigned_to: NONE,
      ...defaultValues,
    },
  })

  const status = useWatch({ control, name: 'status' })

  async function submit(values: LeadFormValues) {
    setFormError(null)
    try {
      await onSubmit({
        full_name: values.full_name,
        phone: values.phone ?? '',
        email: values.email ?? '',
        source: values.source,
        status: values.status,
        lost_reason: values.status === 'lost' ? (values.lost_reason ?? '') : '',
        interested_project: values.interested_project === NONE ? null : (values.interested_project ?? null),
        referred_by: values.referred_by === NONE ? null : (values.referred_by ?? null),
        assigned_to: values.assigned_to === NONE ? null : (values.assigned_to ?? null),
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
      <FormSection title="Who">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
          {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </FormSection>

      <FormSection title="Where they came from">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="source">Source</Label>
          <Controller
            control={control}
            name="source"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {LEAD_SOURCE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="referred_by">Referred by</Label>
          <Controller
            control={control}
            name="referred_by"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="referred_by">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {customers?.results.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Pipeline">
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
                  {LEAD_STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {LEAD_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="interested_project">Interested project</Label>
          <Controller
            control={control}
            name="interested_project"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="interested_project">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {projects?.results.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="assigned_to">Assigned to</Label>
          <Controller
            control={control}
            name="assigned_to"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="assigned_to">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {users?.results.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {status === 'lost' && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="lost_reason">Lost reason</Label>
            <Textarea id="lost_reason" rows={2} {...register('lost_reason')} />
          </div>
        )}
      </FormSection>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div className="flex items-center justify-between gap-3">
        {footerExtra}
        <div className="flex flex-1 items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
