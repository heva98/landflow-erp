import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useRolesQuery } from '../hooks/use-roles'

export function RoleSelect({
  value,
  onChange,
  placeholder = 'No role',
}: {
  value: string
  onChange: (id: string) => void
  placeholder?: string
}) {
  const { data, isLoading } = useRolesQuery()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading roles…' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
