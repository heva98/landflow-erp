import { ShieldCheck, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { UserDialog } from '../components/user-dialog'
import { useRolesQuery } from '../hooks/use-roles'
import { useUpdateUserMutation, useUsersQuery } from '../hooks/use-users'
import { canManageUsers } from '../lib/permissions'

function ToggleActiveButton({ userId, isActive }: { userId: string; isActive: boolean }) {
  const updateUser = useUpdateUserMutation(userId)
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={updateUser.isPending}
      className={isActive ? 'text-destructive hover:text-destructive' : undefined}
      onClick={() => updateUser.mutate({ is_active: !isActive })}
    >
      {isActive ? 'Deactivate' : 'Activate'}
    </Button>
  )
}

export function UsersListPage() {
  const [search, setSearch] = useState('')
  const [roleId, setRoleId] = useState('all')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const { user: me } = useAuth()
  const canManage = canManageUsers(me?.permissions)
  const { data: roles } = useRolesQuery()

  const { data, isLoading, isError } = useUsersQuery({
    search: search || undefined,
    role: roleId === 'all' ? undefined : roleId,
    is_active: activeFilter === 'all' ? undefined : activeFilter === 'active',
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/administration">
              <ShieldCheck /> Roles & permissions
            </Link>
          </Button>
          {canManage && <UserDialog />}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles?.results.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as typeof activeFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Loading users…</TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">Failed to load users.</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No users yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{user.email}</TableCell>
                <TableCell>{`${user.first_name} ${user.last_name}`.trim() || '—'}</TableCell>
                <TableCell>{user.role?.name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'success' : 'secondary'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  {canManage && (
                    <>
                      <ToggleActiveButton userId={user.id} isActive={user.is_active} />
                      <UserDialog user={user} />
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
