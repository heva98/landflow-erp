import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2, Upload } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useCreateDocumentMutation } from '../hooks/use-documents'
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPES } from '../types'

const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  document_type: z.enum(DOCUMENT_TYPES),
  category: z.string().max(100).optional(),
  description: z.string().optional(),
  file: z.instanceof(FileList).refine((files) => files.length === 1, 'Select a file'),
})

type UploadDocumentValues = z.infer<typeof uploadDocumentSchema>

interface UploadDocumentDialogProps {
  /** "<app_label>.<model>", e.g. "acquisitions.landacquisition" — omit for a standalone document. */
  contentType?: string
  objectId?: string
  triggerLabel?: string
}

export function UploadDocumentDialog({ contentType, objectId, triggerLabel = 'Upload document' }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const createDocument = useCreateDocumentMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadDocumentValues>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: { document_type: 'other' },
  })

  async function submit(values: UploadDocumentValues) {
    setFormError(null)
    try {
      await createDocument.mutateAsync({
        title: values.title,
        document_type: values.document_type,
        category: values.category ?? '',
        description: values.description ?? '',
        content_type: contentType,
        object_id: objectId,
        file: values.file[0],
      })
      setOpen(false)
      reset()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setFormError("You don't have permission to do that.")
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" aria-invalid={Boolean(errors.title)} {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document_type">Document type</Label>
            <Controller
              control={control}
              name="document_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="document_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {DOCUMENT_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Input id="category" placeholder="e.g. Title Deed, Sale Agreement" {...register('category')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" aria-invalid={Boolean(errors.file)} {...register('file')} />
            {errors.file && <p className="text-sm text-destructive">{errors.file.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register('description')} />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
