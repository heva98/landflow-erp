import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useDriversQuery } from '../hooks/use-site-visits'

export function DriverSelectForBus({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useDriversQuery({ is_active: true })

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading drivers…' : 'No driver assigned'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((driver) => (
          <SelectItem key={driver.id} value={driver.id}>
            {driver.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
