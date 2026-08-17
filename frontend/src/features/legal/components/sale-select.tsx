import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSalesQuery } from '@/features/sales/hooks/use-sales'

/** Picks an active Sale to attach a legal record to — legal paperwork only applies to live sales. */
export function SaleSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useSalesQuery({ status: 'active' })

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading sales…' : 'Select a sale'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((sale) => (
          <SelectItem key={sale.id} value={sale.id}>
            {sale.sale_number} · {sale.customer_name} · Plot {sale.plot_number}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
