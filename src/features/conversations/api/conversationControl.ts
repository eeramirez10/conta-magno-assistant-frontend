import { endpoints } from '../../../shared/api/endpoints'
import { httpPostJson } from '../../../shared/api/httpClient'
import type { ConversationListItem } from '../types'

type ConversationControlResponse = {
  ok: boolean
  data: ConversationListItem
}

export async function takeConversationControl(conversationId: string): Promise<ConversationListItem> {
  const response = await httpPostJson<ConversationControlResponse, Record<string, never>>(
    endpoints.takeConversationControl(conversationId),
    {},
  )

  return response.data
}

export async function releaseConversationControl(conversationId: string): Promise<ConversationListItem> {
  const response = await httpPostJson<ConversationControlResponse, Record<string, never>>(
    endpoints.releaseConversationControl(conversationId),
    {},
  )

  return response.data
}
