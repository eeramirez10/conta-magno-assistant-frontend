export type ConversationDirection = "IN" | "OUT"

export type ConversationListItem = {
  id: string
  contactId: string
  contactName: string | null
  contactPhone: string | null
  contactWaId: string | null
  displayName: string
  provider: string
  stage: string
  status: string
  updatedAt: string
}

export type ConversationMessage = {
  id: string
  direction: ConversationDirection
  text: string
  createdAt: string
}

export type ConversationDetail = ConversationListItem & {
  createdAt: string
  messages: ConversationMessage[]
}
