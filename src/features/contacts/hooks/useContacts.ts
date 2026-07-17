import { useCallback, useState } from 'react'

import { deleteContact, listContacts } from '../api/contacts'
import type { Contact } from '../types'

type UseContactsState = {
  contacts: Contact[]
  loading: boolean
  error: string | null
  loadContacts: () => Promise<void>
  refetchContacts: () => Promise<void>
  deleteContact: (contactId: string) => Promise<void>
}

export function useContacts(): UseContactsState {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async (showLoading: boolean) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      setContacts(await listContacts())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar los contactos')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  const loadContacts = useCallback(() => fetchContacts(true), [fetchContacts])
  const refetchContacts = useCallback(() => fetchContacts(false), [fetchContacts])

  const removeContact = useCallback(async (contactId: string) => {
    await deleteContact(contactId)
    setContacts((currentContacts) => currentContacts.filter((contact) => contact.id !== contactId))
  }, [])

  return {
    contacts,
    loading,
    error,
    loadContacts,
    refetchContacts,
    deleteContact: removeContact,
  }
}
