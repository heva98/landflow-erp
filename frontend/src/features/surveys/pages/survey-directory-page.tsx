import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { SurveyCompanySelect } from '../components/selects'
import { useCreateSurveyCompanyMutation, useCreateSurveyorMutation, useSurveyCompaniesQuery, useSurveyorsQuery } from '../hooks/use-surveys'
import { canManageSurveyCompanies, canManageSurveyors } from '../lib/permissions'

const companySchema = z.object({
  name: z.string().min(1, 'Required'),
  license_number: z.string().optional(),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})
type CompanyValues = z.infer<typeof companySchema>

function AddCompanyDialog() {
  const [open, setOpen] = useState(false)
  const createCompany = useCreateSurveyCompanyMutation()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
  })

  async function submit(values: CompanyValues) {
    await createCompany.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Add company
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add survey company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="license_number">License number</Label>
            <Input id="license_number" {...register('license_number')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact_person">Contact person</Label>
            <Input id="contact_person" {...register('contact_person')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const surveyorSchema = z.object({
  company: z.string().min(1, 'Select a company'),
  full_name: z.string().min(1, 'Required'),
  license_number: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})
type SurveyorValues = z.infer<typeof surveyorSchema>

function AddSurveyorDialog() {
  const [open, setOpen] = useState(false)
  const createSurveyor = useCreateSurveyorMutation()
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SurveyorValues>({
    resolver: zodResolver(surveyorSchema),
    defaultValues: { company: '' },
  })

  async function submit(values: SurveyorValues) {
    await createSurveyor.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Add surveyor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add surveyor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label>Company</Label>
            <Controller
              control={control}
              name="company"
              render={({ field }) => <SurveyCompanySelect value={field.value} onChange={field.onChange} />}
            />
            {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="license_number">License number</Label>
            <Input id="license_number" {...register('license_number')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SurveyDirectoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canAddCompany = canManageSurveyCompanies(user?.permissions)
  const canAddSurveyor = canManageSurveyors(user?.permissions)
  const { data: companies, isLoading: companiesLoading } = useSurveyCompaniesQuery()
  const { data: surveyors, isLoading: surveyorsLoading } = useSurveyorsQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/surveys')} aria-label="Back to surveys">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Survey companies &amp; surveyors</h1>
      </div>

      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="surveyors">Surveyors</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="flex flex-col gap-4">
          <div className="flex justify-end">{canAddCompany && <AddCompanyDialog />}</div>
          <div className="rounded-xl bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>License #</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companiesLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Loading…</TableCell>
                  </TableRow>
                )}
                {companies && companies.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No survey companies yet.</TableCell>
                  </TableRow>
                )}
                {companies?.results.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium text-foreground">{company.name}</TableCell>
                    <TableCell>{company.license_number || '—'}</TableCell>
                    <TableCell>{company.contact_person || '—'}</TableCell>
                    <TableCell>{company.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={company.is_active ? 'success' : 'secondary'}>
                        {company.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="surveyors" className="flex flex-col gap-4">
          <div className="flex justify-end">{canAddSurveyor && <AddSurveyorDialog />}</div>
          <div className="rounded-xl bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>License #</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveyorsLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Loading…</TableCell>
                  </TableRow>
                )}
                {surveyors && surveyors.results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No surveyors yet.</TableCell>
                  </TableRow>
                )}
                {surveyors?.results.map((surveyor) => (
                  <TableRow key={surveyor.id}>
                    <TableCell className="font-medium text-foreground">{surveyor.full_name}</TableCell>
                    <TableCell>{surveyor.company_name}</TableCell>
                    <TableCell>{surveyor.license_number || '—'}</TableCell>
                    <TableCell>{surveyor.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={surveyor.is_active ? 'success' : 'secondary'}>
                        {surveyor.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
