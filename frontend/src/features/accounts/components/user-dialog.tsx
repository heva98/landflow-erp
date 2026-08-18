import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { Loader2, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { User } from '@/features/auth/types'

import { useCreateUserMutation, useUpdateUserMutation } from '../hooks/use-users'
import { RoleSelect } from './role-select'

function buildUserSchema(isEdit: boolean) {
  return z.object({
    email: z.string().email('Enter a valid email address'),
    first_name: z.string().max(150).optional(),
    last_name: z.string().max(150).optional(),
    role_id: z.string().optional(),
    password: isEdit
      ? z.union([z.string().min(8, 'At least 8 characters'), z.literal('')]).optional()
      : z.string().min(8, 'At least 8 characters'),
    is_active: z.boolean().optional(),
  })
}
type UserValues = z.infer<ReturnType<typeof buildUserSchema>>

function extractError(error: unknown): string {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, string[] | string>
    const first = Object.values(data)[0]
    return Array.isArray(first) ? first[0] : String(first)
  }
  return 'Something went wrong. Please try again.'
}

export function UserDialog({ user }: { user?: User }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createUser = useCreateUserMutation()
  const updateUser = useUpdateUserMutation(user?.id ?? '')

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserValues>({
    resolver: zodResolver(buildUserSchema(Boolean(user))),
    defaultValues: {
      email: user?.email ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      role_id: user?.role?.id ?? '',
      password: '',
      is_active: user?.is_active ?? true,
    },
  })

  async function submit(values: UserValues) {
    setError(null)
    const input = {
      email: values.email,
      first_name: values.first_name ?? '',
      last_name: values.last_name ?? '',
      role_id: values.role_id || null,
      ...(values.password ? { password: values.password } : {}),
      ...(user ? { is_active: values.is_active } : {}),
    }
    try {
      if (user) {
        await updateUser.mutateAsync(input)
      } else {
        await createUser.mutateAsync({ ...input, password: values.password })
      }
      setOpen(false)
      reset()
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {user ? (
          <Button size="icon" variant="ghost" aria-label="Edit user">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm">
            <Plus /> New user
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Edit user' : 'New user'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" {...register('first_name')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" {...register('last_name')} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Controller
              control={control}
              name="role_id"
              render={({ field }) => (
                <RoleSelect value={field.value ?? ''} onChange={field.onChange} placeholder="No role" />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{user ? 'New password (optional)' : 'Password'}</Label>
            <Input id="password" type="password" aria-invalid={Boolean(errors.password)} {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            {user && <p className="text-xs text-muted-foreground">Leave blank to keep the current password.</p>}
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="is_active" className="font-normal">Active</Label>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {user ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
