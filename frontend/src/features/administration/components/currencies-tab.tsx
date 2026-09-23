import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useCurrenciesQuery } from '../hooks/use-administration'
import { canManageCurrencies } from '../lib/permissions'
import { CurrencyDialog } from './currency-dialog'

export function CurrenciesTab() {
  const { user } = useAuth()
  const canManage = canManageCurrencies(user?.permissions)
  const { data, isLoading } = useCurrenciesQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">{canManage && <CurrencyDialog />}</div>
      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Exchange rate</TableHead>
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
                <TableCell colSpan={6} className="text-center text-muted-foreground">No currencies yet.</TableCell>
              </TableRow>
            )}
            {data?.results.map((currency) => (
              <TableRow key={currency.id}>
                <TableCell className="font-medium text-foreground">{currency.code}</TableCell>
                <TableCell>{currency.name}</TableCell>
                <TableCell>{currency.symbol || '—'}</TableCell>
                <TableCell>{currency.exchange_rate}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {currency.is_base && <Badge variant="info">Base</Badge>}
                    <Badge variant={currency.is_active ? 'success' : 'secondary'}>
                      {currency.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">{canManage && <CurrencyDialog currency={currency} />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
