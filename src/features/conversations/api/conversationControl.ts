import { endpoints } from '../../../shared/api/endpoints'
import { httpGet, httpPostJson } from '../../../shared/api/httpClient'
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
  const state = await httpGet<{data: {control: {sessionId: string}}}>(`/api/conversations/${conversationId}/capabilities`)
  const response = await httpPostJson<ConversationControlResponse, {controlSessionId: string}>(
    endpoints.releaseConversationControl(conversationId),
    {controlSessionId: state.data.control.sessionId},
  )

  return response.data
}
