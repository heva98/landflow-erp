import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'
import { formatTZS } from '@/lib/utils'

import { INSTALLMENT_STATUS_LABELS, INSTALLMENT_STATUSES } from '../../installments/types'
import { useInstallmentReportQuery } from '../hooks/use-reports'
import type { InstallmentReportRow } from '../types'
import { ExportButtons } from './export-buttons'
import { ReportTable, type ReportColumn } from './report-table'
import { SummaryCardsRow } from './summary-cards'

const COLUMNS: ReportColumn<InstallmentReportRow>[] = [
  { key: 'sale_number', label: 'Sale #' },
  { key: 'customer', label: 'Customer' },
  { key: 'project', label: 'Project' },
  { key: 'plot_number', label: 'Plot #' },
  { key: 'sequence', label: '#' },
  { key: 'due_date', label: 'Due Date', render: (row) => new Date(row.due_date).toLocaleDateString() },
  { key: 'amount_due', label: 'Amount Due', align: 'right', render: (row) => formatTZS(row.amount_due) },
  { key: 'penalty_amount', label: 'Penalty', align: 'right', render: (row) => formatTZS(row.penalty_amount) },
  { key: 'amount_paid', label: 'Paid', align: 'right', render: (row) => formatTZS(row.amount_paid) },
  { key: 'balance', label: 'Balance', align: 'right', render: (row) => formatTZS(row.balance) },
  { key: 'status', label: 'Status' },
]

export function InstallmentReportView() {
  const [project, setProject] = useState('all')
  const [status, setStatus] = useState('all')
  const [dueDateFrom, setDueDateFrom] = useState('')
  const [dueDateTo, setDueDateTo] = useState('')

  const { data: projects } = useProjectsQuery({ page_size: 200 })

  const params = {
    project: project === 'all' ? undefined : project,
    status: status === 'all' ? undefined : status,
    due_date_from: dueDateFrom || undefined,
    due_date_to: dueDateTo || undefined,
  }

  const { data, isLoading, isError } = useInstallmentReportQuery(params)

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
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {INSTALLMENT_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {INSTALLMENT_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="installments_due_from">Due From</Label>
            <Input
              id="installments_due_from"
              type="date"
              value={dueDateFrom}
              onChange={(event) => setDueDateFrom(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="installments_due_to">Due To</Label>
            <Input
              id="installments_due_to"
              type="date"
              value={dueDateTo}
              onChange={(event) => setDueDateTo(event.target.value)}
            />
          </div>
        </div>
        <ExportButtons report="installments" params={params} disabled={isLoading || isError} />
      </div>

      {data && (
        <SummaryCardsRow
          items={[
            { label: 'Number of Installments', value: data.summary.count },
            { label: 'Total Amount Due', value: formatTZS(data.summary.total_amount_due) },
            { label: 'Total Paid', value: formatTZS(data.summary.total_paid) },
            {
              label: 'Total Balance',
              value: formatTZS(data.summary.total_balance),
              tone: Number(data.summary.total_balance) > 0 ? 'negative' : 'positive',
            },
          ]}
        />
      )}

      <ReportTable
        columns={COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No installments match these filters."
        getRowKey={(row) => `${row.sale_number}-${row.sequence}`}
      />
    </div>
  )
}
