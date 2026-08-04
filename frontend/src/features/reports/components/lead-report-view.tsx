import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LEAD_SOURCE_LABELS, LEAD_SOURCES, LEAD_STATUS_LABELS, LEAD_STATUSES } from '@/features/crm/types'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'

import { useLeadReportQuery } from '../hooks/use-reports'
import type { LeadReportRow } from '../types'
import { ExportButtons } from './export-buttons'
import { ReportTable, type ReportColumn } from './report-table'
import { SummaryCardsRow } from './summary-cards'

const COLUMNS: ReportColumn<LeadReportRow>[] = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'Status' },
  { key: 'interested_project', label: 'Interested Project' },
  { key: 'assigned_to', label: 'Assigned To' },
  { key: 'created_at', label: 'Created At', render: (row) => new Date(row.created_at).toLocaleDateString() },
]

export function LeadReportView() {
  const [project, setProject] = useState('all')
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: projects } = useProjectsQuery({ page_size: 200 })

  const params = {
    project: project === 'all' ? undefined : project,
    source: source === 'all' ? undefined : source,
    status: status === 'all' ? undefined : status,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }

  const { data, isLoading, isError } = useLeadReportQuery(params)

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
            <Label>Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {LEAD_SOURCES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {LEAD_SOURCE_LABELS[value]}
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
                {LEAD_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {LEAD_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="leads_date_from">From</Label>
            <Input id="leads_date_from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="leads_date_to">To</Label>
            <Input id="leads_date_to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
        </div>
        <ExportButtons report="leads" params={params} disabled={isLoading || isError} />
      </div>

      {data && (
        <>
          <SummaryCardsRow
            items={[
              { label: 'Total Leads', value: data.summary.count },
              { label: 'Conversion Rate', value: `${Number(data.summary.conversion_rate).toFixed(1)}%`, tone: 'positive' },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-foreground">
                {Object.entries(data.summary.by_status).map(([key, count]) => (
                  <span key={key}>
                    {LEAD_STATUS_LABELS[key as keyof typeof LEAD_STATUS_LABELS] ?? key}: <strong>{count}</strong>
                  </span>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>By source</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-foreground">
                {Object.entries(data.summary.by_source).map(([key, count]) => (
                  <span key={key}>
                    {LEAD_SOURCE_LABELS[key as keyof typeof LEAD_SOURCE_LABELS] ?? key}: <strong>{count}</strong>
                  </span>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <ReportTable
        columns={COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No leads match these filters."
        getRowKey={(row, index) => `${row.phone || row.email || row.full_name}-${index}`}
      />
    </div>
  )
}
