import { endpoints } from '../../../shared/api/endpoints'
import { HttpError, httpDelete, httpGet } from '../../../shared/api/httpClient'
import type { Contact } from '../types'

type ListContactsResponse = {
  ok: boolean
  items: Contact[]
}

export async function listContacts(): Promise<Contact[]> {
  const response = await httpGet<ListContactsResponse>(endpoints.contacts, { limit: 200 })
  return response.items
}

export async function deleteContact(contactId: string): Promise<void> {
  try {
    await httpDelete(endpoints.contactById(contactId))
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return
    throw error
  }
}
