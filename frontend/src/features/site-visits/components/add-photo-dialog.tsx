import { zodResolver } from '@hookform/resolvers/zod'
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

import { useCreatePhotoMutation } from '../hooks/use-site-visits'

const addPhotoSchema = z.object({
  caption: z.string().optional(),
  file: z.instanceof(FileList).refine((files) => files.length === 1, 'Select a photo'),
})
type AddPhotoValues = z.infer<typeof addPhotoSchema>

export function AddPhotoDialog({ siteVisitId }: { siteVisitId: string }) {
  const [open, setOpen] = useState(false)
  const createPhoto = useCreatePhotoMutation(siteVisitId)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddPhotoValues>({
    resolver: zodResolver(addPhotoSchema),
  })

  async function submit(values: AddPhotoValues) {
    await createPhoto.mutateAsync({ site_visit: siteVisitId, caption: values.caption ?? '', file: values.file[0] })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus /> Add photo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add photo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file">Photo</Label>
            <Input id="file" type="file" accept="image/*" aria-invalid={Boolean(errors.file)} {...register('file')} />
            {errors.file && <p className="text-sm text-destructive">{errors.file.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" {...register('caption')} />
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
