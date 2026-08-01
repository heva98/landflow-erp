import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { SaleStatusBadge } from '../components/sale-status-badge'
import { useSalesQuery } from '../hooks/use-sales'
import { canCreateSales } from '../lib/permissions'
import { SALE_STATUS_LABELS, SALE_STATUSES, SALE_TYPE_LABELS, SALE_TYPES, type SaleStatus, type SaleType } from '../types'

export function SalesListPage() {
  const [status, setStatus] = useState<SaleStatus | 'all'>('all')
  const [saleType, setSaleType] = useState<SaleType | 'all'>('all')
  const { user } = useAuth()
  const canCreate = canCreateSales(user?.permissions)

  const { data, isLoading, isError } = useSalesQuery({
    status: status === 'all' ? undefined : status,
    sale_type: saleType === 'all' ? undefined : saleType,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Sales</h1>
        {canCreate && (
          <Button asChild>
            <Link to="/sales/new">
              <Plus /> New sale
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={(value) => setStatus(value as SaleStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {SALE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {SALE_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={saleType} onValueChange={(value) => setSaleType(value as SaleType | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All sale types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sale types</SelectItem>
            {SALE_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {SALE_TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale #</TableHead>
              <TableHead>Plot</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sale price</TableHead>
              <TableHead>Balance due</TableHead>
              <TableHead>Sold at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Loading sales…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-destructive">
                  Failed to load sales.
                </TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No sales yet.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((sale) => (
              <TableRow key={sale.id} className="cursor-pointer">
                <TableCell className="font-medium text-foreground">
                  <Link to={`/sales/${sale.id}`}>{sale.sale_number}</Link>
                </TableCell>
                <TableCell>{sale.plot_number}</TableCell>
                <TableCell>{sale.customer_name}</TableCell>
                <TableCell>{SALE_TYPE_LABELS[sale.sale_type]}</TableCell>
                <TableCell>
                  <SaleStatusBadge status={sale.status} />
                </TableCell>
                <TableCell>{formatTZS(sale.sale_price)}</TableCell>
                <TableCell>{formatTZS(sale.balance_due)}</TableCell>
                <TableCell>{new Date(sale.sold_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
