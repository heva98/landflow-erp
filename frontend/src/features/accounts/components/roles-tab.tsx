import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useRolesQuery } from '../hooks/use-roles'

export function RolesTab() {
  const { data, isLoading } = useRolesQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Loading roles…</TableCell>
              </TableRow>
            )}
            {data?.results.map((role, index) => (
              <TableRow key={role.id}>
                <TableCell className="align-top text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="align-top font-medium text-foreground">
                  <div>{role.name}</div>
                  {role.description && <div className="text-xs text-muted-foreground">{role.description}</div>}
                </TableCell>
                <TableCell className="align-top">
                  {role.full_access && <Badge variant="success">Full access</Badge>}
                  {role.read_only_all && <Badge variant="info">View everything</Badge>}
                  {!role.full_access && !role.read_only_all && <Badge variant="secondary">Scoped</Badge>}
                </TableCell>
                <TableCell className="align-top">
                  {role.full_access || role.read_only_all ? (
                    <span className="text-muted-foreground">
                      {role.full_access ? 'All permissions, implicitly.' : 'View permission on every model, implicitly.'}
                    </span>
                  ) : role.permissions.length === 0 ? (
                    <span className="text-muted-foreground">No permissions granted.</span>
                  ) : (
                    <div className="flex max-w-2xl flex-wrap gap-1">
                      {role.permissions.map((codename) => (
                        <Badge key={codename} variant="outline">{codename}</Badge>
                      ))}
                    </div>
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
