import { endpoints } from '../../../shared/api/endpoints'
import { httpGet, httpPostJson } from '../../../shared/api/httpClient'

export type AuthenticatedUser = {
  id: string
  username: string
}

type SessionResponse = {
  ok: boolean
  data: {
    user: AuthenticatedUser
  }
}

type LoginResponse = {
  ok: boolean
  data: {
    user: AuthenticatedUser
    token: string
  }
}

export async function login(username: string, password: string): Promise<LoginResponse['data']> {
  const response = await httpPostJson<LoginResponse, { username: string; password: string }>(
    endpoints.login,
    { username, password },
  )

  return response.data
}

export async function getCurrentSession(): Promise<AuthenticatedUser> {
  const response = await httpGet<SessionResponse>(endpoints.currentSession)
  return response.data.user
}

export async function logout(): Promise<void> {
  await httpPostJson<{ ok: boolean }, Record<string, never>>(endpoints.logout, {})
}
