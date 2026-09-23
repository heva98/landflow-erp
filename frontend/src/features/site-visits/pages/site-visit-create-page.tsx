import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { BusSelect, ProjectSelect } from '../components/selects'
import { useCreateSiteVisitMutation } from '../hooks/use-site-visits'

const siteVisitFormSchema = z.object({
  project: z.string().min(1, 'Select a project'),
  visit_date: z.string().min(1, 'Required'),
  departure_time: z.string().optional(),
  meeting_point: z.string().optional(),
  bus: z.string().optional(),
  notes: z.string().optional(),
})
type SiteVisitFormValues = z.infer<typeof siteVisitFormSchema>

export function SiteVisitCreatePage() {
  const navigate = useNavigate()
  const createSiteVisit = useCreateSiteVisitMutation()
  const [formError, setFormError] = useState<string | null>(null)

  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SiteVisitFormValues>({
    resolver: zodResolver(siteVisitFormSchema),
    defaultValues: { project: '', bus: '' },
  })

  async function submit(values: SiteVisitFormValues) {
    setFormError(null)
    try {
      const visit = await createSiteVisit.mutateAsync({
        project: values.project,
        visit_date: values.visit_date,
        departure_time: values.departure_time || null,
        meeting_point: values.meeting_point ?? '',
        bus: values.bus || null,
        notes: values.notes ?? '',
      })
      navigate(`/site-visits/${visit.id}`)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setFormError("You don't have permission to do that.")
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">New site visit</h1>
      <form onSubmit={handleSubmit(submit)} className="flex max-w-2xl flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label>Project</Label>
          <Controller
            control={control}
            name="project"
            render={({ field }) => <ProjectSelect value={field.value} onChange={field.onChange} />}
          />
          {errors.project && <p className="text-sm text-destructive">{errors.project.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="visit_date">Visit date</Label>
            <Input id="visit_date" type="date" aria-invalid={Boolean(errors.visit_date)} {...register('visit_date')} />
            {errors.visit_date && <p className="text-sm text-destructive">{errors.visit_date.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="departure_time">Departure time</Label>
            <Input id="departure_time" type="time" {...register('departure_time')} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meeting_point">Meeting point</Label>
          <Input id="meeting_point" {...register('meeting_point')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Bus</Label>
          <Controller
            control={control}
            name="bus"
            render={({ field }) => <BusSelect value={field.value ?? ''} onChange={field.onChange} />}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={3} {...register('notes')} />
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Create site visit
          </Button>
        </div>
      </form>
    </div>
  )
}
