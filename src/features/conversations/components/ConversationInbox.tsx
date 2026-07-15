import { useEffect,  useState } from 'react'
import { useConversationDetail } from '../hooks/useConversationDetail'
import { useConversations } from '../hooks/useConversations'
import { ConversationListPanel } from './ConversationListPanel'
import { ConversationChatPanel } from './ConversationChatPanel'
import {
  releaseConversationControl,
  takeConversationControl,
} from '../api/conversationControl'
import { sendConversationMessage } from '../api/sendConversationMessage'

type ConversationInboxProps = {
  variant?: 'dashboard' | 'whatsapp'
}

export function ConversationInbox({ variant = 'dashboard' }: ConversationInboxProps) {
  const isWhatsAppView = variant === 'whatsapp'
  const {
    data,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    loadConversations,
    refetch: refetchConversations,
  } = useConversations()
  const {
    activeConversationId,
    conversation,
    loading: detailLoading,
    error: detailError,
    openConversation,
    refetchActiveConversation,
  } = useConversationDetail()
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const filteredConversations = data.filter((item) => {
    const search = (filters.search || '').trim().toLowerCase()
    const matchesSearch =
      search.length === 0 ||
      item.displayName.toLowerCase().includes(search) ||
      (item.contactWaId || '').toLowerCase().includes(search) ||
      (item.contactPhone || '').toLowerCase().includes(search) ||
      item.stage.toLowerCase().includes(search) ||
      item.status.toLowerCase().includes(search)

    const matchesStatus = !filters.status || item.status === filters.status

    return matchesSearch && matchesStatus
  })

  const statuses = Array.from(new Set(data.map((item) => item.status))).sort((left, right) => left.localeCompare(right))


  useEffect(() => {
    if (filteredConversations.length === 0) {
      return
    }

    const hasActiveConversation = filteredConversations.some((item) => item.id === activeConversationId)

    if (!hasActiveConversation) {
      void openConversation(filteredConversations[0].id)
    }
  }, [activeConversationId, filteredConversations, openConversation])

  const refreshConversationData = async () => {
    await Promise.all([refetchActiveConversation(), refetchConversations()])
  }

  const runConversationAction = async (action: () => Promise<unknown>) => {
    setActionLoading(true)
    setActionError(null)

    try {
      await action()
      await refreshConversationData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar la acción'
      setActionError(message)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handleTakeControl = async () => {
    if (!activeConversationId) return
    await runConversationAction(() => takeConversationControl(activeConversationId))
  }

  const handleReleaseControl = async () => {
    if (!activeConversationId) return
    await runConversationAction(() => releaseConversationControl(activeConversationId))
  }

  const handleSendMessage = async (text: string) => {
    if (!activeConversationId) return
    await runConversationAction(() => sendConversationMessage(activeConversationId, text))
  }

  const handleOpenConversation = (conversationId: string) => {
    setShowMobileChat(true)
    void openConversation(conversationId)
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
  }

  return (
    <div className={isWhatsAppView ? 'overflow-hidden p-0 ' : 'space-y-6 overflow-auto'}>

      <section className="flex">
        <div className={showMobileChat ? 'hidden lg:block' : 'block w-full lg:block lg:w-auto'}>
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
            onOpen={handleOpenConversation}
          />
        </div>

        <div className={showMobileChat ? 'block w-full lg:block' : 'hidden w-full lg:block'}>
          <ConversationChatPanel
            conversation={conversation}
            loading={detailLoading}
            error={detailError}
            actionLoading={actionLoading}
            actionError={actionError}
            showBackButton={showMobileChat}
            onBack={handleBackToList}
            onTakeControl={handleTakeControl}
            onReleaseControl={handleReleaseControl}
            onSendMessage={handleSendMessage}
          />
        </div>

      </section>
    </div>
  )
}
