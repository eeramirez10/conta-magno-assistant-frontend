export type Contact = {
  id: string
  fullName: string
  waId: string
  phoneE164: string
  email: string | null
  timezone: string
  consentPrivacy: boolean
  conversationCount: number
  inquiryCount: number
  messageCount: number
  latestInquiry: {
    folio: string
    status: string
    clientType: string | null
    rfcStatus: 'YES' | 'NO' | 'UNKNOWN'
    specialtyProfile: string | null
    mainNeed: string | null
    urgency: string | null
    budgetRange: string | null
    recommendedPlan: string | null
    notes: string | null
    updatedAt: string
  } | null
  createdAt: string
  updatedAt: string
}
