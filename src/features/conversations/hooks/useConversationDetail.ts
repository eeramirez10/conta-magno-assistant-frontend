import { useCallback, useEffect, useRef, useState } from "react"
import type { ConversationDetail } from "../types"
import { getConversationById } from "../api/getConversationById"
import { useRealtime } from "../../../shared/realtime/realtime-context"

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

  const { socket } = useRealtime()
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const fetchConversation = useCallback(async (conversationId: string, showLoading: boolean) => {
    const requestId = ++requestIdRef.current
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const data = await getConversationById(conversationId);
      if (requestId !== requestIdRef.current) return
      setConversation(data)
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      const message = error instanceof Error ? error.message : 'No se pudo cargar la conversacion'
      setError(message)
      setConversation(null)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  const openConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId)
    await fetchConversation(conversationId, true)
  }, [fetchConversation])

  const refetchActiveConversation = useCallback(async () => {

    if(!activeConversationId) return
    await fetchConversation(activeConversationId, false)
  }, [activeConversationId, fetchConversation])

  const clearActiveConversation = useCallback(() => {
    requestIdRef.current += 1
    setActiveConversationId(null);
    setConversation(null);
    setError(null)
  },[])

  useEffect(() => {
    if (!activeConversationId) return

    const joinActiveConversation = () => {
      socket.emit('conversation:join', activeConversationId)
    }

    const handleMessageCreated = (event: { conversationId: string; message: ConversationDetail['messages'][number] }) => {
      if (event.conversationId !== activeConversationId) return

      setConversation((currentConversation) => {
        if (!currentConversation || currentConversation.id !== activeConversationId) {
          return currentConversation
        }

        const messageAlreadyExists = currentConversation.messages.some((message) => message.id === event.message.id)
        if (messageAlreadyExists) return currentConversation

        return {
          ...currentConversation,
          updatedAt: event.message.createdAt,
          messages: [...currentConversation.messages, event.message],
        }
      })
    }

    const handleConversationUpdated = (event: { conversationId: string }) => {
      if (event.conversationId === activeConversationId) {
        void fetchConversation(activeConversationId, false)
      }
    }

    const reconcileAfterReconnect = () => {
      joinActiveConversation()
      void fetchConversation(activeConversationId, false)
    }

    if (socket.connected) joinActiveConversation()
    socket.on('connect', reconcileAfterReconnect)
    socket.on('message:created', handleMessageCreated)
    socket.on('conversation:updated', handleConversationUpdated)

    return () => {
      socket.emit('conversation:leave', activeConversationId)
      socket.off('connect', reconcileAfterReconnect)
      socket.off('message:created', handleMessageCreated)
      socket.off('conversation:updated', handleConversationUpdated)
    }
  }, [activeConversationId, fetchConversation, socket])


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
