import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'
import { SALE_STATUS_LABELS, SALE_STATUSES, SALE_TYPE_LABELS, SALE_TYPES } from '@/features/sales/types'
import { formatTZS } from '@/lib/utils'

import { useSalesReportQuery } from '../hooks/use-reports'
import type { SalesReportRow } from '../types'
import { ExportButtons } from './export-buttons'
import { ReportTable, type ReportColumn } from './report-table'
import { SummaryCardsRow } from './summary-cards'

function firstOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

const COLUMNS: ReportColumn<SalesReportRow>[] = [
  { key: 'sale_number', label: 'Sale #' },
  { key: 'sold_at', label: 'Sold At', render: (row) => new Date(row.sold_at).toLocaleDateString() },
  { key: 'project', label: 'Project' },
  { key: 'plot_number', label: 'Plot #' },
  { key: 'customer', label: 'Customer' },
  { key: 'sale_type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'sale_price', label: 'Sale Price', align: 'right', render: (row) => formatTZS(row.sale_price) },
  { key: 'discount', label: 'Discount', align: 'right', render: (row) => formatTZS(row.discount) },
  { key: 'balance_due', label: 'Balance Due', align: 'right', render: (row) => formatTZS(row.balance_due) },
  { key: 'sold_by', label: 'Sold By' },
]

export function SalesReportView() {
  const [project, setProject] = useState('all')
  const [dateFrom, setDateFrom] = useState(firstOfMonth())
  const [dateTo, setDateTo] = useState(today())
  const [saleType, setSaleType] = useState('all')
  const [status, setStatus] = useState('all')

  const { data: projects } = useProjectsQuery({ page_size: 200 })

  const params = {
    project: project === 'all' ? undefined : project,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sale_type: saleType === 'all' ? undefined : saleType,
    status: status === 'all' ? undefined : status,
  }

  const { data, isLoading, isError } = useSalesReportQuery(params)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Project</Label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects?.results.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sales_date_from">From</Label>
            <Input id="sales_date_from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sales_date_to">To</Label>
            <Input id="sales_date_to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Sale Type</Label>
            <Select value={saleType} onValueChange={setSaleType}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {SALE_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {SALE_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
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
          </div>
        </div>
        <ExportButtons report="sales" params={params} disabled={isLoading || isError} />
      </div>

      {data && (
        <SummaryCardsRow
          items={[
            { label: 'Number of Sales', value: data.summary.count },
            { label: 'Total Sale Price', value: formatTZS(data.summary.total_sale_price) },
            { label: 'Total Discount', value: formatTZS(data.summary.total_discount) },
            {
              label: 'Total Balance Due',
              value: formatTZS(data.summary.total_balance_due),
              tone: Number(data.summary.total_balance_due) > 0 ? 'negative' : 'positive',
            },
          ]}
        />
      )}

      <ReportTable
        columns={COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No sales in this period."
        getRowKey={(row) => row.sale_number}
      />
    </div>
  )
}
