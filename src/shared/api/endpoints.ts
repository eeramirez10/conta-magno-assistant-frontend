export const endpoints = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  currentSession: '/api/auth/me',
  contacts: '/api/contacts',
  contactById: (id: string) => `${endpoints.contacts}/${id}`,
  conversations: '/api/conversations',
  conversationsById: (id: string) => `${endpoints.conversations}/${id}`,
  takeConversationControl: (id: string) => `${endpoints.conversations}/${id}/take-control`,
  releaseConversationControl: (id: string) => `${endpoints.conversations}/${id}/release-control`,
  conversationMessages: (id: string) => `${endpoints.conversations}/${id}/messages`,
} as const
