import type { ConversationListItem } from '../types'
import Badge from '../../../shared/ui/badge/Badge'
import { Loader } from '../../../shared/components/Loader'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../../shared/ui/table'

type Props = {
  rows: ConversationListItem[]
  activeConversationId?: string | null
  loading: boolean
  error: string | null
  onRowClick: (conversationId: string) => void
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function resolveStatusColor(status: string): 'success' | 'warning' | 'error' | 'info' | 'dark' {
  if (status === 'OPEN') return 'success'
  if (status === 'CLOSED') return 'error'
  if (status === 'COMPLETED') return 'info'
  if (status === 'PENDING_HUMAN') return 'warning'
  return 'dark'
}

export function ConversationsTable({
  rows,
  activeConversationId,
  loading,
  error,
  onRowClick,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-slate-200 bg-slate-50/80">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Contacto
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Teléfono
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Proveedor
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Estado
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Etapa
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Última actividad
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-200">
            {rows.map((row) => {
              const isActive = row.id === activeConversationId

              return (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick(row.id)}
                  className={isActive ? 'cursor-pointer bg-[#f0fffb]' : 'cursor-pointer transition hover:bg-slate-50'}
                >
                  <TableCell className="px-5 py-4 text-left">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{row.displayName}</p>
                      <p className="text-xs text-slate-500">{row.contactName || 'Lead capturado por WhatsApp'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-slate-600">{row.contactPhone || '-'}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-slate-600">{formatLabel(row.provider)}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-slate-600">
                    <Badge size="sm" color={resolveStatusColor(row.status)}>
                      {formatLabel(row.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-slate-600">{formatLabel(row.stage)}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-slate-600">{formatDate(row.updatedAt)}</TableCell>
                </TableRow>
              )
            })}

            {!loading && !error && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                  No hay conversaciones para mostrar.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && error ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-10 text-center text-sm text-rose-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {loading ? (
        <div className="absolute inset-0 grid place-items-center bg-white/80 backdrop-blur-sm">
          <Loader />
        </div>
      ) : null}
    </div>
  )
}
