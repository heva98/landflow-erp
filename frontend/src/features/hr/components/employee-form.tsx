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
import { useCreateDocumentMutation } from '@/features/documents/hooks/use-documents'
import type { DocumentType } from '@/features/documents/types'

import { EMPLOYMENT_TYPE_LABELS, EMPLOYMENT_TYPES, type Employee, type EmployeeInput } from '../types'
import { DepartmentSelect, EmployeeSelect } from './selects'

const employeeFormSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(255),
  job_title: z.string().max(255).optional(),
  department: z.string().optional(),
  manager: z.string().optional(),
  employment_type: z.enum(EMPLOYMENT_TYPES),
  phone: z.string().max(30).optional(),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
  national_id: z.string().max(50).optional(),
  address: z.string().max(255).optional(),
  date_of_birth: z.string().optional(),
  hire_date: z.string().optional(),
  basic_salary: z.number().nonnegative('Must be zero or more'),
  bank_name: z.string().max(255).optional(),
  bank_account_number: z.string().max(50).optional(),
  emergency_contact_name: z.string().max(255).optional(),
  emergency_contact_phone: z.string().max(30).optional(),
  notes: z.string().max(2000).optional(),
  cv_file: z.instanceof(FileList).optional(),
  academic_certificates: z.instanceof(FileList).optional(),
  academic_transcripts: z.instanceof(FileList).optional(),
  passport_photo: z.instanceof(FileList).optional(),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>
  submitLabel: string
  onSubmit: (input: EmployeeInput) => Promise<Employee>
  onSuccess: (employee: Employee) => void
  /** Show the CV/certificates/transcripts/passport photo uploaders — only meaningful on the create form. */
  showDocumentUpload?: boolean
}

function inferDocumentType(fileName: string): DocumentType {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (extension === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(extension)) return 'word'
  if (['xls', 'xlsx'].includes(extension)) return 'excel'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image'
  return 'other'
}

function collectEmployeeDocuments(values: EmployeeFormValues) {
  const uploads: { file: File; category: string }[] = []
  if (values.cv_file?.[0]) uploads.push({ file: values.cv_file[0], category: 'CV' })
  for (const file of values.academic_certificates ?? []) uploads.push({ file, category: 'Academic Certificate' })
  for (const file of values.academic_transcripts ?? []) uploads.push({ file, category: 'Academic Transcript' })
  if (values.passport_photo?.[0]) uploads.push({ file: values.passport_photo[0], category: 'Passport Photo' })
  return uploads
}

export function EmployeeForm({ defaultValues, submitLabel, onSubmit, onSuccess, showDocumentUpload }: EmployeeFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const createDocument = useCreateDocumentMutation()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: { employment_type: 'full_time', basic_salary: 0, ...defaultValues },
  })

  async function submit(values: EmployeeFormValues) {
    setFormError(null)
    try {
      const employee = await onSubmit({
        full_name: values.full_name,
        job_title: values.job_title ?? '',
        department: values.department || null,
        manager: values.manager || null,
        employment_type: values.employment_type,
        phone: values.phone ?? '',
        email: values.email ?? '',
        national_id: values.national_id ?? '',
        address: values.address ?? '',
        date_of_birth: values.date_of_birth || null,
        hire_date: values.hire_date || undefined,
        basic_salary: values.basic_salary,
        bank_name: values.bank_name ?? '',
        bank_account_number: values.bank_account_number ?? '',
        emergency_contact_name: values.emergency_contact_name ?? '',
        emergency_contact_phone: values.emergency_contact_phone ?? '',
        notes: values.notes ?? '',
      })

      if (showDocumentUpload) {
        // Best-effort: the employee record already exists, so a failed upload
        // here shouldn't block navigation — any missing file can be added
        // again from the employee's Documents tab.
        await Promise.allSettled(
          collectEmployeeDocuments(values).map(({ file, category }) =>
            createDocument.mutateAsync({
              title: `${category} — ${employee.full_name}`,
              document_type: inferDocumentType(file.name),
              category,
              content_type: 'hr.employee',
              object_id: employee.id,
              file,
            }),
          ),
        )
      }

      onSuccess(employee)
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
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
          {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="job_title">Job title</Label>
          <Input id="job_title" {...register('job_title')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Department</Label>
          <Controller
            control={control}
            name="department"
            render={({ field }) => <DepartmentSelect value={field.value ?? ''} onChange={field.onChange} />}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Manager</Label>
          <Controller
            control={control}
            name="manager"
            render={({ field }) => (
              <EmployeeSelect value={field.value ?? ''} onChange={field.onChange} placeholder="No manager" />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="employment_type">Employment type</Label>
          <Controller
            control={control}
            name="employment_type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="employment_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {EMPLOYMENT_TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hire_date">Hire date</Label>
          <Input id="hire_date" type="date" {...register('hire_date')} />
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="national_id">National ID</Label>
          <Input id="national_id" {...register('national_id')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date_of_birth">Date of birth</Label>
          <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register('address')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="basic_salary">Basic salary (TZS)</Label>
          <Input
            id="basic_salary"
            type="number"
            step="0.01"
            min="0"
            aria-invalid={Boolean(errors.basic_salary)}
            {...register('basic_salary', { valueAsNumber: true })}
          />
          {errors.basic_salary && <p className="text-sm text-destructive">{errors.basic_salary.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bank_name">Bank name</Label>
          <Input id="bank_name" {...register('bank_name')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bank_account_number">Bank account number</Label>
          <Input id="bank_account_number" {...register('bank_account_number')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergency_contact_name">Emergency contact name</Label>
          <Input id="emergency_contact_name" {...register('emergency_contact_name')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergency_contact_phone">Emergency contact phone</Label>
          <Input id="emergency_contact_phone" {...register('emergency_contact_phone')} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={3} {...register('notes')} />
        </div>
      </div>

      {showDocumentUpload && (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Documents</h2>
            <p className="text-sm text-muted-foreground">Optional — you can also add these later from the employee page.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cv_file">CV</Label>
              <Input id="cv_file" type="file" accept=".pdf,.doc,.docx" {...register('cv_file')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="passport_photo">Passport photo</Label>
              <Input id="passport_photo" type="file" accept="image/*" {...register('passport_photo')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="academic_certificates">Academic certificates</Label>
              <Input
                id="academic_certificates"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                {...register('academic_certificates')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="academic_transcripts">Academic transcripts</Label>
              <Input
                id="academic_transcripts"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                {...register('academic_transcripts')}
              />
            </div>
          </div>
        </div>
      )}

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
