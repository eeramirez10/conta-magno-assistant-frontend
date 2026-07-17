import { useEffect, useMemo, useState } from 'react'

import { useContacts } from '../features/contacts/hooks/useContacts'
import type { Contact } from '../features/contacts/types'
import { useRealtime } from '../shared/realtime/realtime-context'
import { Loader } from '../shared/components/Loader'
import { Modal } from '../shared/ui/modal'
import { formatDateTime } from '../shared/utils/formatDateTime'
import { formatLabel } from '../shared/utils/formatLabel'

const DELETE_CONFIRMATION = 'ELIMINAR'

function displayName(contact: Contact): string {
  return /^prospecto conta magno$/i.test(contact.fullName.trim())
    ? contact.waId
    : contact.fullName
}

function rfcLabel(status: NonNullable<Contact['latestInquiry']>['rfcStatus']): string {
  if (status === 'YES') return 'Sí, con RFC'
  if (status === 'NO') return 'No tiene RFC'
  return 'Pendiente de confirmar'
}

export function ContactsPage() {
  const { contacts, loading, error, loadContacts, refetchContacts, deleteContact } = useContacts()
  const { socket } = useRealtime()
  const [search, setSearch] = useState('')
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    void loadContacts()
  }, [loadContacts])

  useEffect(() => {
    let refreshTimer: number | undefined
    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => {
        void refetchContacts()
      }, 100)
    }

    socket.on('conversation:updated', scheduleRefresh)
    socket.on('conversation:deleted', scheduleRefresh)
    socket.on('connect', scheduleRefresh)

    return () => {
      window.clearTimeout(refreshTimer)
      socket.off('conversation:updated', scheduleRefresh)
      socket.off('conversation:deleted', scheduleRefresh)
      socket.off('connect', scheduleRefresh)
    }
  }, [refetchContacts, socket])

  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return contacts

    return contacts.filter((contact) => [
      contact.fullName,
      contact.waId,
      contact.phoneE164,
      contact.email ?? '',
    ].some((value) => value.toLowerCase().includes(normalizedSearch)))
  }, [contacts, search])

  const closeDeleteModal = () => {
    if (isDeleting) return
    setContactToDelete(null)
    setConfirmation('')
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!contactToDelete || confirmation !== DELETE_CONFIRMATION) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteContact(contactToDelete.id)
      closeDeleteModal()
    } catch (requestError) {
      setDeleteError(requestError instanceof Error ? requestError.message : 'No se pudo eliminar el contacto')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[30px] bg-[#102a2f] px-6 py-7 text-white shadow-[0_22px_60px_rgba(15,40,47,0.18)] md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8ce3d7]">Directorio operativo</p>
        <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Contactos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c6dedc]">
              Consulta los datos registrados de cada lead y elimina de forma permanente los registros que ya no deban conservarse.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[#a9cfca]">Total</p>
            <p className="mt-1 text-2xl font-semibold">{contacts.length}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Leads registrados</h2>
          <p className="mt-1 text-sm text-slate-500">Los contactos se actualizan conforme llegan nuevos mensajes de WhatsApp.</p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          type="search"
          placeholder="Buscar nombre, WhatsApp o correo"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#008069] focus:ring-4 focus:ring-emerald-100 sm:w-80"
        />
      </section>

      {loading ? <div className="grid min-h-80 place-items-center"><Loader /></div> : null}
      {!loading && error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</p> : null}

      {!loading && !error ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredContacts.map((contact) => (
            <article key={contact.id} className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_20px_48px_rgba(16,185,129,0.12)]">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[80px] bg-emerald-50 transition group-hover:bg-emerald-100" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#102a2f] text-sm font-semibold text-[#c8fff7]">
                    {displayName(contact).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-950">{displayName(contact)}</h3>
                    <p className="mt-1 truncate text-xs text-slate-500">WhatsApp: {contact.waId}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{contact.consentPrivacy ? 'Consentimiento' : 'Sin consentimiento'}</span>
              </div>

              <dl className="relative mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Teléfono</dt><dd className="truncate font-medium text-slate-800">{contact.phoneE164 || 'Sin teléfono'}</dd></div>
                <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Correo</dt><dd className="truncate font-medium text-slate-800">{contact.email ?? 'Sin correo'}</dd></div>
                <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Última actividad</dt><dd className="font-medium text-slate-800">{formatDateTime(contact.updatedAt)}</dd></div>
              </dl>

              {contact.latestInquiry ? (
                <section className="relative mt-5 rounded-2xl border border-[#bce8df] bg-[#f2fcf9] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#007c6b]">Contexto para atención</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">Folio {contact.latestInquiry.folio}</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#007c6b] shadow-sm">{formatLabel(contact.latestInquiry.status)}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
                    <div className="col-span-2">
                      <p className="text-slate-500">Necesidad principal</p>
                      <p className="mt-1 font-semibold leading-5 text-slate-900">{contact.latestInquiry.mainNeed ?? 'Pendiente de identificar'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Paquete recomendado</p>
                      <p className="mt-1 font-semibold text-[#007c6b]">{contact.latestInquiry.recommendedPlan ?? 'Pendiente'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">RFC</p>
                      <p className="mt-1 font-semibold text-slate-900">{rfcLabel(contact.latestInquiry.rfcStatus)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500">Tipo de contribuyente</p>
                      <p className="mt-1 font-semibold leading-5 text-slate-900">{contact.latestInquiry.clientType ? formatLabel(contact.latestInquiry.clientType) : 'Pendiente de confirmar'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Perfil / giro</p>
                      <p className="mt-1 font-medium text-slate-800">{contact.latestInquiry.specialtyProfile ?? 'Pendiente'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Urgencia</p>
                      <p className="mt-1 font-medium text-slate-800">{contact.latestInquiry.urgency ?? 'Pendiente'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500">Rango de presupuesto</p>
                      <p className="mt-1 font-medium text-slate-800">{contact.latestInquiry.budgetRange ?? 'Pendiente'}</p>
                    </div>
                    {contact.latestInquiry.notes ? (
                      <div className="col-span-2 border-t border-[#ccece5] pt-3">
                        <p className="text-slate-500">Notas</p>
                        <p className="mt-1 whitespace-pre-wrap leading-5 text-slate-700">{contact.latestInquiry.notes}</p>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : (
                <div className="relative mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  Aún no hay una inquiry para este contacto. La calificación está pendiente.
                </div>
              )}

              <div className="relative mt-6 grid grid-cols-3 gap-2 border-y border-slate-100 py-4 text-center">
                <div><p className="text-lg font-semibold text-slate-950">{contact.conversationCount}</p><p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Chats</p></div>
                <div><p className="text-lg font-semibold text-slate-950">{contact.inquiryCount}</p><p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Inquiries</p></div>
                <div><p className="text-lg font-semibold text-slate-950">{contact.messageCount}</p><p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Mensajes</p></div>
              </div>

              <button
                type="button"
                onClick={() => setContactToDelete(contact)}
                className="relative mt-5 w-full rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Eliminar contacto y datos
              </button>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && !error && filteredContacts.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No se encontraron contactos con esos datos.</div>
      ) : null}

      <Modal isOpen={Boolean(contactToDelete)} onClose={closeDeleteModal} className="max-w-lg p-7" showCloseButton={!isDeleting}>
        {contactToDelete ? (
          <div className="space-y-5">
            <div className="pr-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Acción irreversible</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Eliminar {displayName(contactToDelete)}</h2>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Se eliminarán permanentemente el contacto, sus conversaciones, mensajes, inquiries, notificaciones y citas asociadas. Esta acción no se puede deshacer.
            </p>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Escribe {DELETE_CONFIRMATION} para confirmar</span>
              <input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value.toUpperCase())}
                disabled={isDeleting}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </label>
            {deleteError ? <p className="text-sm text-rose-600">{deleteError}</p> : null}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeDeleteModal} disabled={isDeleting} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="button" onClick={() => void handleDelete()} disabled={confirmation !== DELETE_CONFIRMATION || isDeleting} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-45">
                {isDeleting ? 'Eliminando...' : 'Eliminar permanentemente'}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
