import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useLocationsQuery } from '../hooks/use-administration'
import type { LocationType } from '../types'

export function LocationSelect({
  value,
  onChange,
  locationType,
  placeholder = 'Select a location',
}: {
  value: string
  onChange: (id: string) => void
  locationType: LocationType
  placeholder?: string
}) {
  const { data, isLoading } = useLocationsQuery({ location_type: locationType })

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading…' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            {location.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
