export const endpoints = {
  conversations: '/api/conversations',
  conversationsById: (id: string) => `${endpoints.conversations}/${id}`,
} as const
