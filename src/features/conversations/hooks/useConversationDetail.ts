import { useCallback, useState } from "react"
import type { ConversationDetail } from "../types"
import { getConversationById } from "../api/getConversationById"

type UseConversationDetailState = {
  activeConversationId: string | null
  conversation: ConversationDetail | null
  loading: boolean
  error: string | null
  openConversation: (conversationId: string) => Promise<void>
  refetchActiveConversation: () => Promise<void>
  clearActiveConversation: () => void
}

export const useConversationDetail = (): UseConversationDetailState => {

  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openConversation = useCallback( async (activeConversationId:string) => {
    setActiveConversationId(activeConversationId)
    setLoading(true)
    setError(null)

    try {
      const data = await getConversationById(activeConversationId);
      setConversation(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar la conversacion'
      setError(message)
      setConversation(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const refetchActiveConversation = useCallback(async () => {

    if(!activeConversationId) return
    await openConversation(activeConversationId)
  }, [activeConversationId, openConversation])

  const clearActiveConversation = useCallback(() => {
    setActiveConversationId(null);
    setConversation(null);
    setError(null)
  },[])


  return {
    activeConversationId,
    conversation,
    loading,
    error,
    openConversation,
    refetchActiveConversation,
    clearActiveConversation
  }

}