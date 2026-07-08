import { endpoints } from '../../../shared/api/endpoints'
import { httpGet } from '../../../shared/api/httpClient'
import type { ConversationListItem } from '../types'

export type ListConversationsParams = {
  search?: string
  status?: string
}

type ListConversationApiResponse = {
  ok: boolean
  items: ConversationListItem[]
}

export async function listConversations(): Promise<ConversationListItem[]> {
  const response = await httpGet<ListConversationApiResponse>(endpoints.conversations, { limit: 100 })
  return response.items
}
