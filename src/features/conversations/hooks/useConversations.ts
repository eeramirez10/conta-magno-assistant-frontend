import { useCallback, useState } from 'react'

import { listConversations, type ListConversationsParams } from '../api/listConversation'
import type { ConversationListItem } from '../types'

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

  const loadConversations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await listConversations()
      setData(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las conversaciones'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    loadConversations,
    refetch: loadConversations,
  }
}
