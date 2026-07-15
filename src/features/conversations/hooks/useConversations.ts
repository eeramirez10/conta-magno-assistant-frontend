import { useCallback, useEffect, useState } from 'react'

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

  const updateFilters = useCallback((partial: Partial<ListConversationsParams>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
  }, [])

  const fetchConversations = useCallback(async (showLoading: boolean) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const response = await listConversations()
      setData(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las conversaciones'
      setError(message)
    } finally {
      if (showLoading) setLoading(false)
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

    socket.on('conversation:updated', scheduleRefresh)
    socket.on('connect', reconcileAfterReconnect)

    return () => {
      window.clearTimeout(refreshTimer)
      socket.off('conversation:updated', scheduleRefresh)
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
  }
}
