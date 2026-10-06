import { httpGet, httpPatchJson, httpPostJson } from '../../../shared/api/httpClient'

export type IncomingNotificationSettings = {
  enabled: boolean
  recipients: string[]
  templateName: string
  languageCode: string
  templateMode: 'INCOMING_MESSAGE' | 'OWNER_LEAD'
}

export type IncomingNotificationSettingsResponse = {
  data: IncomingNotificationSettings
  metaConfigured: boolean
  ownerLeadTemplate: { name: string; languageCode: string } | null
}

export type NotificationTestResult = {
  recipient: string
  accepted: boolean
  error?: string
}

const endpoint = '/api/settings/incoming-notifications'

export function getIncomingNotificationSettings() {
  return httpGet<IncomingNotificationSettingsResponse>(endpoint)
}

export function saveIncomingNotificationSettings(settings: IncomingNotificationSettings) {
  return httpPatchJson<IncomingNotificationSettingsResponse, IncomingNotificationSettings>(endpoint, settings)
}

export function testIncomingNotificationSettings() {
  return httpPostJson<{ results: NotificationTestResult[] }, Record<string, never>>(`${endpoint}/test`, {})
}
