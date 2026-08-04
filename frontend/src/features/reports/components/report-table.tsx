import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export interface ReportColumn<TRow> {
  key: keyof TRow
  label: string
  align?: 'left' | 'right'
  render?: (row: TRow) => React.ReactNode
}

interface ReportTableProps<TRow> {
  columns: ReportColumn<TRow>[]
  rows: TRow[] | undefined
  isLoading: boolean
  isError: boolean
  emptyMessage: string
  getRowKey: (row: TRow, index: number) => string
}

export function ReportTable<TRow>({ columns, rows, isLoading, isError, emptyMessage, getRowKey }: ReportTableProps<TRow>) {
  return (
    <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)} className={column.align === 'right' ? 'text-right' : undefined}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          )}
          {isError && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-destructive">
                Failed to load report.
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !isError && rows && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            !isError &&
            rows?.map((row, index) => (
              <TableRow key={getRowKey(row, index)}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className={column.align === 'right' ? 'text-right' : undefined}>
                    {column.render ? column.render(row) : String(row[column.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
