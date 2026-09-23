import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useCreateDocumentTemplateMutation, useDocumentTemplatesQuery } from '../hooks/use-legal'
import { canManageDocumentTemplates } from '../lib/permissions'
import { TEMPLATE_TYPE_LABELS, TEMPLATE_TYPES } from '../types'

const createSchema = z.object({
  name: z.string().min(1, 'Required'),
  template_type: z.enum(TEMPLATE_TYPES),
  description: z.string().optional(),
})
type CreateValues = z.infer<typeof createSchema>

function CreateTemplateDialog() {
  const [open, setOpen] = useState(false)
  const createTemplate = useCreateDocumentTemplateMutation()
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', template_type: 'other' },
  })

  async function submit(values: CreateValues) {
    await createTemplate.mutateAsync(values)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New document template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="template_type">Type</Label>
            <Controller
              control={control}
              name="template_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="template_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {TEMPLATE_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DocumentTemplatesTab() {
  const { user } = useAuth()
  const canManage = canManageDocumentTemplates(user?.permissions)
  const { data, isLoading } = useDocumentTemplatesQuery()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        The actual template file for each of these attaches through the Documents module.
      </p>
      <div className="flex justify-end">{canManage && <CreateTemplateDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">No templates yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((template, index) => (
              <TableRow key={template.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{template.name}</TableCell>
                <TableCell>{TEMPLATE_TYPE_LABELS[template.template_type]}</TableCell>
                <TableCell>
                  <Badge variant={template.is_active ? 'success' : 'secondary'}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
