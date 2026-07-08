import { endpoints } from '../../../shared/api/endpoints'
import { httpPostJson } from '../../../shared/api/httpClient'
import type { ConversationMessage } from '../types'

type SendConversationMessageResponse = {
  ok: boolean
  data: ConversationMessage
}

export async function sendConversationMessage(
  conversationId: string,
  text: string,
): Promise<ConversationMessage> {
  const response = await httpPostJson<SendConversationMessageResponse, { text: string }>(
    endpoints.conversationMessages(conversationId),
    { text },
  )

  return response.data
}
