import { Loader2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'

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

/** A single-field confirm dialog for workflow actions that need one bit of input (a reason, a number). */
export function ActionPromptDialog({
  trigger,
  title,
  label,
  placeholder,
  required = false,
  confirmLabel = 'Confirm',
  destructive = false,
  onConfirm,
}: {
  trigger: ReactNode
  title: string
  label: string
  placeholder?: string
  required?: boolean
  confirmLabel?: string
  destructive?: boolean
  onConfirm: (value: string) => Promise<unknown>
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (required && !value.trim()) {
      setError('This field is required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(value)
      setOpen(false)
      setValue('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prompt-value">{label}</Label>
          <Input
            id="prompt-value"
            value={value}
            placeholder={placeholder}
            onChange={(event) => setValue(event.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant={destructive ? 'destructive' : 'default'} disabled={submitting} onClick={submit}>
            {submitting && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
