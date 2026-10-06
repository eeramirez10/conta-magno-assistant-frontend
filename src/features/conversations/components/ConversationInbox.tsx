import { useEffect, useRef, useState } from 'react'
import { useConversationDetail } from '../hooks/useConversationDetail'
import { useConversations } from '../hooks/useConversations'
import { ConversationListPanel } from './ConversationListPanel'
import { ConversationChatPanel } from './ConversationChatPanel'
import { deleteContact } from '../../contacts/api/contacts'
import type { ConversationListItem } from '../types'
import {
  releaseConversationControl,
  takeConversationControl,
} from '../api/conversationControl'
import { sendConversationMessage } from '../api/sendConversationMessage'

type ConversationInboxProps = {
  variant?: 'dashboard' | 'whatsapp'
}

const fullscreenPanelStorageKey = 'conta-magno:conversations-fullscreen-panel'

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
    removeContactConversations,
  } = useConversations()
  const {
    activeConversationId,
    conversation,
    loading: detailLoading,
    error: detailError,
    openConversation,
    refetchActiveConversation,
    clearActiveConversation,
  } = useConversationDetail()
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<ConversationListItem | null>(null)
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null)
  const deleteCancelButtonRef = useRef<HTMLButtonElement>(null)
  const [fullscreenPanel, setFullscreenPanel] = useState<'chat' | 'inbox' | null>(() => {
    const savedPanel = window.localStorage.getItem(fullscreenPanelStorageKey)

    return savedPanel === 'chat' || savedPanel === 'inbox' ? savedPanel : null
  })
  const isChatFullscreen = fullscreenPanel === 'chat'
  const isInboxFullscreen = fullscreenPanel === 'inbox'

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (!fullscreenPanel) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isContextMenuOpen && !conversationToDelete) {
        setFullscreenPanel(null)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [conversationToDelete, fullscreenPanel, isContextMenuOpen])

  useEffect(() => {
    if (!conversationToDelete) return
    deleteCancelButtonRef.current?.focus()
  }, [conversationToDelete])

  useEffect(() => {
    if (fullscreenPanel) {
      window.localStorage.setItem(fullscreenPanelStorageKey, fullscreenPanel)
      return
    }

    window.localStorage.removeItem(fullscreenPanelStorageKey)
  }, [fullscreenPanel])

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

  const restoreConversationListFocus = (conversationId: string) => {
    window.requestAnimationFrame(() => {
      const row = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-conversation-id]'))
        .find((item) => item.dataset.conversationId === conversationId)
      const target = row ?? document.querySelector<HTMLElement>('[data-conversation-list-heading]')
      target?.focus()
    })
  }

  const closeDeleteDialog = () => {
    if (deleteLoading) return
    const conversationId = conversationToDelete?.id
    setConversationToDelete(null)
    setDeleteError(null)
    if (conversationId) restoreConversationListFocus(conversationId)
  }

  const handleDeleteConversation = async () => {
    if (!conversationToDelete || deleteLoading) return
    const selected = conversationToDelete
    setDeleteLoading(true)
    setDeleteError(null)

    try {
      await deleteContact(selected.contactId)
      const activeBelongsToContact = data.some((item) => item.id === activeConversationId && item.contactId === selected.contactId)
      removeContactConversations(selected.contactId)
      if (activeBelongsToContact) {
        clearActiveConversation()
        const remaining = filteredConversations.filter((item) => item.contactId !== selected.contactId)
        if (remaining.length === 0) setShowMobileChat(false)
      }
      setConversationToDelete(null)
      setDeleteNotice('Se eliminó el contacto y todas sus conversaciones.')
      window.setTimeout(() => setDeleteNotice(null), 6000)
      restoreConversationListFocus(selected.id)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'No se pudo eliminar el contacto y sus conversaciones.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleOpenConversation = (conversationId: string) => {
    if (fullscreenPanel === 'inbox') {
      setFullscreenPanel('chat')
    }

    setShowMobileChat(true)
    void openConversation(conversationId)
  }

  const handleBackToList = () => {
    if (fullscreenPanel === 'chat') {
      setFullscreenPanel('inbox')
    }

    setShowMobileChat(false)
  }

  return (
    <div className={isWhatsAppView ? 'overflow-hidden p-0 ' : 'space-y-6 overflow-auto'}>

      {deleteNotice ? <p role="status" className="fixed bottom-5 left-1/2 z-[99999] -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-900 shadow-xl">{deleteNotice}</p> : null}

      <section className="flex">
        <div className={isChatFullscreen ? 'hidden' : showMobileChat ? 'hidden lg:block' : 'block w-full lg:block lg:w-auto'}>
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
            onDeleteRequest={(selected) => {
              setDeleteError(null)
              setConversationToDelete(selected)
            }}
            onContextMenuStateChange={setIsContextMenuOpen}
            isFullscreen={isInboxFullscreen}
            onToggleFullscreen={() => setFullscreenPanel((currentValue) => currentValue === 'inbox' ? null : 'inbox')}
          />
        </div>

        <div className={isInboxFullscreen ? 'hidden' : isChatFullscreen || showMobileChat ? 'block w-full lg:block' : 'hidden w-full lg:block'}>
          <ConversationChatPanel
            conversation={conversation}
            loading={detailLoading}
            error={detailError}
            actionLoading={actionLoading}
            actionError={actionError}
            showBackButton={showMobileChat}
            isFullscreen={isChatFullscreen}
            onBack={handleBackToList}
            onToggleFullscreen={() => setFullscreenPanel((currentValue) => currentValue === 'chat' ? null : 'chat')}
            onTakeControl={handleTakeControl}
            onReleaseControl={handleReleaseControl}
            onSendMessage={handleSendMessage}
          />
        </div>

      </section>

      {conversationToDelete ? (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-4 py-6 backdrop-blur-sm" onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            closeDeleteDialog()
            return
          }
          if (event.key === 'Tab') {
            const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
            const first = buttons[0]
            const last = buttons[buttons.length - 1]
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first?.focus()
            }
          }
        }}>
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-conversation-title"
            aria-describedby="delete-conversation-warning"
            className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Eliminación permanente</p>
            <h2 id="delete-conversation-title" className="mt-2 text-2xl font-semibold text-slate-950">
              ¿Eliminar la conversación de {conversationToDelete.displayName}?
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-700">
              WhatsApp: {conversationToDelete.contactWaId || conversationToDelete.contactPhone || 'Sin número registrado'}
            </p>
            <p id="delete-conversation-warning" className="mt-4 text-sm leading-6 text-slate-600">
              Se eliminarán permanentemente este contacto, todas sus conversaciones y mensajes, sus datos de seguimiento, notificaciones, citas asociadas e historial del asistente. Esta acción no se puede deshacer. Los mensajes que ya están en WhatsApp permanecerán allí.
            </p>
            {deleteError ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{deleteError}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <button ref={deleteCancelButtonRef} type="button" onClick={closeDeleteDialog} disabled={deleteLoading} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-500 disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={() => void handleDeleteConversation()} disabled={deleteLoading} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60">
                {deleteLoading ? 'Eliminando…' : 'Eliminar permanentemente'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
