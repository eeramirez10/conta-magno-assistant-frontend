import type { ConversationMessage } from '../../features/conversations/types'

export type MessageCreatedEvent = {
  conversationId: string
  message: ConversationMessage
}

export type ConversationUpdatedEvent = {
  conversationId: string
}

export interface ServerToClientEvents {
  'message:created': (event: MessageCreatedEvent) => void
  'conversation:updated': (event: ConversationUpdatedEvent) => void
  'conversation:deleted': (event: ConversationUpdatedEvent) => void
}

export interface ClientToServerEvents {
  'conversation:activity': (event: {conversationId:string;controlSessionId:string}, ack: (result:{ok:boolean;expiresAt?:string;serverNow?:string})=>void)=>void

  'conversation:join': (conversationId: string) => void
  'conversation:leave': (conversationId: string) => void
}
