import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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

import { useUploadDocumentVersionMutation } from '../hooks/use-documents'

const uploadVersionSchema = z.object({
  file: z.instanceof(FileList).refine((files) => files.length === 1, 'Select a file'),
  notes: z.string().max(255).optional(),
})

type UploadVersionValues = z.infer<typeof uploadVersionSchema>

export function UploadVersionDialog({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const uploadVersion = useUploadDocumentVersionMutation(documentId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadVersionValues>({ resolver: zodResolver(uploadVersionSchema) })

  async function submit(values: UploadVersionValues) {
    setFormError(null)
    try {
      await uploadVersion.mutateAsync({ file: values.file[0], notes: values.notes })
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
        <Button size="sm" variant="outline">
          <Plus /> Upload new version
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload new version</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" aria-invalid={Boolean(errors.file)} {...register('file')} />
            {errors.file && <p className="text-sm text-destructive">{errors.file.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" placeholder="What changed in this version?" {...register('notes')} />
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
