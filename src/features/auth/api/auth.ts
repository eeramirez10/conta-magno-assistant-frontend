import { endpoints } from '../../../shared/api/endpoints'
import { httpGet, httpPostJson } from '../../../shared/api/httpClient'

export type AuthenticatedUser = {
  id: string
  username: string
}

type AuthResponse = {
  ok: boolean
  data: {
    user: AuthenticatedUser
  }
}

export async function login(username: string, password: string): Promise<AuthenticatedUser> {
  const response = await httpPostJson<AuthResponse, { username: string; password: string }>(
    endpoints.login,
    { username, password },
  )

  return response.data.user
}

export async function getCurrentSession(): Promise<AuthenticatedUser> {
  const response = await httpGet<AuthResponse>(endpoints.currentSession)
  return response.data.user
}

export async function logout(): Promise<void> {
  await httpPostJson<{ ok: boolean }, Record<string, never>>(endpoints.logout, {})
}
