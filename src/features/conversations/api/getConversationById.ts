import { endpoints } from '../../../shared/api/endpoints'
import { httpGet } from '../../../shared/api/httpClient'
import type { ConversationDetail } from '../types'

type GetConversationByIdResponse = {
  ok: boolean
  data: ConversationDetail
}

export async function getConversationById(conversationId: string): Promise<ConversationDetail> {
  const response = await httpGet<GetConversationByIdResponse>(endpoints.conversationsById(conversationId))
  return response.data
}
