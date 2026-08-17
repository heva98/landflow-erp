import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { Textarea } from '@/components/ui/textarea'

import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from '../hooks/use-hr'
import type { Department } from '../types'
import { EmployeeSelect } from './selects'

const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional(),
  manager: z.string().optional(),
})
type DepartmentValues = z.infer<typeof departmentSchema>

export function DepartmentDialog({ department }: { department?: Department }) {
  const [open, setOpen] = useState(false)
  const createDepartment = useCreateDepartmentMutation()
  const updateDepartment = useUpdateDepartmentMutation(department?.id ?? '')

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DepartmentValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name ?? '',
      description: department?.description ?? '',
      manager: department?.manager ?? '',
    },
  })

  async function submit(values: DepartmentValues) {
    const input = { name: values.name, description: values.description ?? '', manager: values.manager || null }
    if (department) {
      await updateDepartment.mutateAsync(input)
    } else {
      await createDepartment.mutateAsync(input)
    }
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {department ? (
          <Button size="icon" variant="ghost" aria-label="Edit department">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> New department
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{department ? 'Edit department' : 'New department'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
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
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {department ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
