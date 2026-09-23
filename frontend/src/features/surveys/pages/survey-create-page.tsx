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

import { ProjectSelect, SurveyCompanySelect, SurveyorSelect } from '../components/selects'
import { useCreateSurveyMutation } from '../hooks/use-surveys'

const surveyFormSchema = z.object({
  project: z.string().min(1, 'Select a project'),
  company: z.string().min(1, 'Select a survey company'),
  lead_surveyor: z.string().min(1, 'Select a lead surveyor'),
  coordinate_system: z.string().optional(),
  scheduled_date: z.string().optional(),
  notes: z.string().optional(),
})
type SurveyFormValues = z.infer<typeof surveyFormSchema>

export function SurveyCreatePage() {
  const navigate = useNavigate()
  const createSurvey = useCreateSurveyMutation()
  const [formError, setFormError] = useState<string | null>(null)

  const { control, register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: { project: '', company: '', lead_surveyor: '' },
  })
  const company = watch('company')

  async function submit(values: SurveyFormValues) {
    setFormError(null)
    try {
      const survey = await createSurvey.mutateAsync({
        project: values.project,
        company: values.company,
        lead_surveyor: values.lead_surveyor,
        coordinate_system: values.coordinate_system || undefined,
        scheduled_date: values.scheduled_date || null,
        notes: values.notes ?? '',
      })
      navigate(`/surveys/${survey.id}`)
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
      <h1 className="text-2xl font-semibold text-foreground">New survey</h1>
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

        <div className="flex flex-col gap-1.5">
          <Label>Survey company</Label>
          <Controller
            control={control}
            name="company"
            render={({ field }) => <SurveyCompanySelect value={field.value} onChange={field.onChange} />}
          />
          {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Lead surveyor</Label>
          <Controller
            control={control}
            name="lead_surveyor"
            render={({ field }) => <SurveyorSelect companyId={company} value={field.value} onChange={field.onChange} />}
          />
          {errors.lead_surveyor && <p className="text-sm text-destructive">{errors.lead_surveyor.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="coordinate_system">Coordinate system</Label>
          <Input id="coordinate_system" placeholder="Arc 1960 / UTM Zone 37S" {...register('coordinate_system')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scheduled_date">Scheduled date</Label>
          <Input id="scheduled_date" type="date" {...register('scheduled_date')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={3} {...register('notes')} />
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Create survey
          </Button>
        </div>
      </form>
    </div>
  )
}
