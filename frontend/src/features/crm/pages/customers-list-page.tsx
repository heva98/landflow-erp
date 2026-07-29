import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useCustomersQuery } from '../hooks/use-customers'
import { CUSTOMER_TYPE_LABELS, CUSTOMER_TYPES, type CustomerType } from '../types'

export function CustomersListPage() {
  const [search, setSearch] = useState('')
  const [customerType, setCustomerType] = useState<CustomerType | 'all'>('all')

  const { data, isLoading, isError } = useCustomersQuery({
    search: search || undefined,
    customer_type: customerType === 'all' ? undefined : customerType,
  })
  const columnCount = 6

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <Button asChild>
          <Link to="/crm/customers/new">
            <Plus /> New customer
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone or email"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={customerType} onValueChange={(value) => setCustomerType(value as CustomerType | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {CUSTOMER_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {CUSTOMER_TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>National ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                  Loading customers…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-destructive">
                  Failed to load customers.
                </TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium text-foreground">
                  <Link to={`/crm/customers/${customer.id}`} className="hover:underline">
                    {customer.full_name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.customer_type === 'organization' ? 'info' : 'secondary'}>
                    {CUSTOMER_TYPE_LABELS[customer.customer_type]}
                  </Badge>
                </TableCell>
                <TableCell>{customer.organization_name || '—'}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email || '—'}</TableCell>
                <TableCell>{customer.national_id || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
