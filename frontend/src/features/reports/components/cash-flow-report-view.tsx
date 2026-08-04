import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CASH_BANK_KIND_LABELS, type CashBankKind } from '@/features/finance/types'
import { formatTZS } from '@/lib/utils'

import { useCashFlowReportQuery } from '../hooks/use-reports'
import type { ReportsCashFlowRow } from '../types'
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

const COLUMNS: ReportColumn<ReportsCashFlowRow>[] = [
  { key: 'name', label: 'Account' },
  { key: 'kind', label: 'Kind', render: (row) => CASH_BANK_KIND_LABELS[row.kind as CashBankKind] ?? row.kind },
  { key: 'opening_balance', label: 'Opening', align: 'right', render: (row) => formatTZS(row.opening_balance) },
  { key: 'inflow', label: 'Inflow', align: 'right', render: (row) => formatTZS(row.inflow) },
  { key: 'outflow', label: 'Outflow', align: 'right', render: (row) => formatTZS(row.outflow) },
  { key: 'closing_balance', label: 'Closing', align: 'right', render: (row) => formatTZS(row.closing_balance) },
]

export function CashFlowReportView() {
  const [dateFrom, setDateFrom] = useState(firstOfMonth())
  const [dateTo, setDateTo] = useState(today())

  const params = { date_from: dateFrom, date_to: dateTo }
  const { data, isLoading, isError } = useCashFlowReportQuery(params)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cash_flow_date_from">From</Label>
            <Input
              id="cash_flow_date_from"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cash_flow_date_to">To</Label>
            <Input id="cash_flow_date_to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
        </div>
        <ExportButtons report="cash-flow" params={params} disabled={isLoading || isError} />
      </div>

      {data && (
        <SummaryCardsRow
          items={[
            { label: 'Total Inflow', value: formatTZS(data.summary.total_inflow) },
            { label: 'Total Outflow', value: formatTZS(data.summary.total_outflow) },
            {
              label: 'Net Cash Flow',
              value: formatTZS(data.summary.net_cash_flow),
              tone: Number(data.summary.net_cash_flow) >= 0 ? 'positive' : 'negative',
            },
          ]}
        />
      )}

      <ReportTable
        columns={COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No cash or bank accounts yet."
        getRowKey={(row) => row.name}
      />
    </div>
  )
}
