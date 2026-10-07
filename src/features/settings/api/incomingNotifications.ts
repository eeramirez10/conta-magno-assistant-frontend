import { httpGet, httpPatchJson, httpPostJson } from '../../../shared/api/httpClient'

export type IncomingNotificationSettings = {
  recipients: string[]
}

export type IncomingNotificationSettingsResponse = {
  data: IncomingNotificationSettings
  metaConfigured: boolean
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
