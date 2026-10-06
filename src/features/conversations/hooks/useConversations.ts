import { useCallback, useEffect, useRef, useState } from 'react'

import { listConversations, type ListConversationsParams } from '../api/listConversation'
import type { ConversationListItem } from '../types'
import { useRealtime } from '../../../shared/realtime/realtime-context'

type UseConversationsState = {
  data: ConversationListItem[]
  loading: boolean
  error: string | null
  filters: ListConversationsParams
  updateFilters: (partial: Partial<ListConversationsParams>) => void
  clearFilters: () => void
  loadConversations: () => Promise<void>
  refetch: () => Promise<void>
  removeContactConversations: (contactId: string) => void
}

const INITIAL_FILTERS: ListConversationsParams = {
  search: '',
  status: undefined,
}

export function useConversations(): UseConversationsState {
  const { socket } = useRealtime()
  const [data, setData] = useState<ConversationListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ListConversationsParams>(INITIAL_FILTERS)
  const requestIdRef = useRef(0)

  const updateFilters = useCallback((partial: Partial<ListConversationsParams>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
  }, [])

  const fetchConversations = useCallback(async (showLoading: boolean) => {
    const requestId = ++requestIdRef.current
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const response = await listConversations()
      if (requestId !== requestIdRef.current) return
      setData(response)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las conversaciones'
      setError(message)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  const loadConversations = useCallback(
    () => fetchConversations(true),
    [fetchConversations],
  )

  const refetchConversations = useCallback(
    () => fetchConversations(false),
    [fetchConversations],
  )

  const removeContactConversations = useCallback((contactId: string) => {
    // Prevent a fetch started before deletion from putting removed rows back into the inbox.
    requestIdRef.current += 1
    setData((current) => current.filter((conversation) => conversation.contactId !== contactId))
    setLoading(false)
    setError(null)
  }, [])

  useEffect(() => {
    let refreshTimer: number | undefined

    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => {
        void refetchConversations()
      }, 75)
    }

    const reconcileAfterReconnect = () => {
      void refetchConversations()
    }

    const handleConversationDeleted = (event: { conversationId: string }) => {
      requestIdRef.current += 1
      setData((current) => current.filter((conversation) => conversation.id !== event.conversationId))
      scheduleRefresh()
    }

    socket.on('conversation:updated', scheduleRefresh)
    socket.on('conversation:deleted', handleConversationDeleted)
    socket.on('connect', reconcileAfterReconnect)

    return () => {
      window.clearTimeout(refreshTimer)
      socket.off('conversation:updated', scheduleRefresh)
      socket.off('conversation:deleted', handleConversationDeleted)
      socket.off('connect', reconcileAfterReconnect)
    }
  }, [refetchConversations, socket])

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    loadConversations,
    refetch: refetchConversations,
    removeContactConversations,
  }
}
