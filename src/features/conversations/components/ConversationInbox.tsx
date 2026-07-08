import { useEffect } from 'react'
import { useConversationDetail } from '../hooks/useConversationDetail'
import { useConversations } from '../hooks/useConversations'
import { OverviewCard } from '../../../shared/components/OverviewCard'
import { ConversationListPanel } from './ConversationListPanel'
import { ConversationChatPanel } from './ConversationChatPanel'


export function ConversationInbox() {
  const { data, loading, error, filters, updateFilters, clearFilters, loadConversations } = useConversations()
  const {
    activeConversationId,
    conversation,
    loading: detailLoading,
    error: detailError,
    openConversation,
  } = useConversationDetail()

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const filteredConversations = data.filter((item) => {
    const search = (filters.search || '').trim().toLowerCase()
    const matchesSearch =
      search.length === 0 ||
      item.displayName.toLowerCase().includes(search) ||
      (item.contactPhone || '').toLowerCase().includes(search) ||
      item.stage.toLowerCase().includes(search) ||
      item.status.toLowerCase().includes(search)

    const matchesStatus = !filters.status || item.status === filters.status

    return matchesSearch && matchesStatus
  })

  const statuses = Array.from(new Set(data.map((item) => item.status))).sort((left, right) => left.localeCompare(right))
  const openCount = data.filter((item) => item.status === 'OPEN').length
  const completedCount = data.filter((item) => item.stage === 'COMPLETED').length
  const waitingCount = data.filter((item) => item.status !== 'OPEN').length

  useEffect(() => {
    if (filteredConversations.length === 0) {
      return
    }

    const hasActiveConversation = filteredConversations.some((item) => item.id === activeConversationId)

    if (!hasActiveConversation) {
      void openConversation(filteredConversations[0].id)
    }
  }, [activeConversationId, filteredConversations, openConversation])

  return (
    <div className="space-y-6 overflow-auto">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Conta Magno</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Centro de conversaciones</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Esta primera versión ya aterriza el diseño del inbox dentro del proyecto real. Lee conversaciones del backend actual y deja listo el espacio donde después responderá un humano desde la misma cuenta de WhatsApp Business.
          </p>
        </div>

        <div className="rounded-full border border-[#b6efe6] bg-[#f0fffb] px-4 py-2 text-sm font-medium text-[#008069]">
          Vista conectada a /api/conversations
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewCard label="Conversaciones" value={String(data.length)} accent="bg-slate-900" />
        <OverviewCard label="Abiertas" value={String(openCount)} accent="bg-emerald-500" />
        <OverviewCard label="Completadas" value={String(completedCount)} accent="bg-cyan-500" />
        <OverviewCard label="Seguimiento" value={String(waitingCount)} accent="bg-amber-400" />
      </section>

      <section className="flex">
        <ConversationListPanel
          rows={filteredConversations}
          activeConversationId={activeConversationId}
          loading={loading}
          error={error}
          search={filters.search || ''}
          status={filters.status}
          statuses={statuses}
          onSearchChange={(value) => updateFilters({ search: value })}
          onStatusChange={(value) => updateFilters({ status: value || undefined })}
          onClear={clearFilters}
          onOpen={(conversationId) => {
            void openConversation(conversationId)
          }}
        />

        <ConversationChatPanel conversation={conversation} loading={detailLoading} error={detailError} />

      </section>
    </div>
  )
}
