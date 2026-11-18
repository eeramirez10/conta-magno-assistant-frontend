import { endpoints } from '../../../shared/api/endpoints'
import { httpGet, httpPostJson } from '../../../shared/api/httpClient'
import type { ConversationMessage } from '../types'

type SendConversationMessageResponse = {
  ok: boolean
  data: ConversationMessage
}

export async function sendConversationMessage(
  conversationId: string,
  text: string,
): Promise<ConversationMessage> {
  const state = await httpGet<{data: {control: {sessionId: string}}}>(`/api/conversations/${conversationId}/capabilities`)
  const response = await httpPostJson<SendConversationMessageResponse, { text: string; controlSessionId: string }>(
    endpoints.conversationMessages(conversationId),
    { text, controlSessionId: state.data.control.sessionId },
  )

  return response.data
}
