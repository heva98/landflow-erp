import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
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

import { useCreateSurveyDocumentMutation } from '../hooks/use-surveys'
import { SURVEY_DOCUMENT_TYPE_LABELS, SURVEY_DOCUMENT_TYPES } from '../types'

const addDocumentSchema = z.object({
  document_type: z.enum(SURVEY_DOCUMENT_TYPES),
  description: z.string().optional(),
  file: z.instanceof(FileList).refine((files) => files.length === 1, 'Select a file'),
})
type AddDocumentValues = z.infer<typeof addDocumentSchema>

export function AddSurveyDocumentDialog({ surveyId }: { surveyId: string }) {
  const [open, setOpen] = useState(false)
  const createDocument = useCreateSurveyDocumentMutation(surveyId)
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddDocumentValues>({
    resolver: zodResolver(addDocumentSchema),
    defaultValues: { document_type: 'other' },
  })

  async function submit(values: AddDocumentValues) {
    await createDocument.mutateAsync({
      survey: surveyId,
      document_type: values.document_type,
      description: values.description ?? '',
      file: values.file[0],
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Upload document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload survey document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
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
                    {SURVEY_DOCUMENT_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {SURVEY_DOCUMENT_TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" aria-invalid={Boolean(errors.file)} {...register('file')} />
            {errors.file && <p className="text-sm text-destructive">{errors.file.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>
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
