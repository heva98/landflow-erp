import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useLocationsQuery } from '../hooks/use-administration'
import { canManageLocations } from '../lib/permissions'
import { LOCATION_TYPE_LABELS, LOCATION_TYPES, type LocationType } from '../types'
import { LocationDialog } from './location-dialog'

export function LocationsTab() {
  const { user } = useAuth()
  const canManage = canManageLocations(user?.permissions)
  const [locationType, setLocationType] = useState<LocationType | 'all'>('all')
  const { data, isLoading } = useLocationsQuery({ location_type: locationType === 'all' ? undefined : locationType })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Select value={locationType} onValueChange={(value) => setLocationType(value as typeof locationType)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {LOCATION_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {LOCATION_TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canManage && <LocationDialog />}
      </div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">SN</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No locations yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((location, index) => (
              <TableRow key={location.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{location.name}</TableCell>
                <TableCell>{LOCATION_TYPE_LABELS[location.location_type]}</TableCell>
                <TableCell>{location.parent_name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={location.is_active ? 'success' : 'secondary'}>
                    {location.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{canManage && <LocationDialog location={location} />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
