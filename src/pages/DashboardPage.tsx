import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ConversationsTable } from '../features/conversations/components/ConversationsTable'
import { useConversations } from '../features/conversations/hooks/useConversations'
import { OverviewCard } from '../shared/components/OverviewCard'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, loading, error, loadConversations } = useConversations()

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const openCount = data.filter((item) => item.status === 'OPEN').length
  const completedCount = data.filter((item) => item.stage === 'COMPLETED').length
  const humanControlCount = data.filter((item) => item.stage === 'PENDING_HUMAN').length

  return (
    <div className="space-y-6 overflow-auto">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Conta Magno</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Consulta el estado general de los leads y las solicitudes registradas por WhatsApp.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard label="Solicitudes" value={String(data.length)} accent="bg-slate-900" />
        <OverviewCard label="Abiertas" value={String(openCount)} accent="bg-emerald-500" />
        <OverviewCard label="Completadas" value={String(completedCount)} accent="bg-cyan-500" />
        <OverviewCard label="Control humano" value={String(humanControlCount)} accent="bg-amber-400" />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Inquiries</h2>
          <p className="mt-1 text-sm text-slate-500">Solicitudes capturadas por el asistente.</p>
        </div>

        <ConversationsTable
          rows={data}
          loading={loading}
          error={error}
          onRowClick={() => navigate('/conversations')}
        />
      </section>
    </div>
  )
}
