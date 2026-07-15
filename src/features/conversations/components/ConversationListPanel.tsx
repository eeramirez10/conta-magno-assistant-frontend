import { Loader } from "../../../shared/components/Loader"
import { MessageIcon } from "../../../shared/components/MessageIcon"
import { SearchIcon } from "../../../shared/components/SearchIcon"
import { formatLabel } from "../../../shared/utils/formatLabel"
import { formatShortDate } from "../../../shared/utils/formatShortDate"
import type { ConversationListItem } from "../types"

function FullscreenIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ConversationListPanel({
  rows,
  activeConversationId,
  loading,
  error,
  search,
  status,
  statuses,
  onSearchChange,
  onStatusChange,
  onClear,
  onOpen,
  isFullscreen = false,
  onToggleFullscreen,
}: {
  rows: ConversationListItem[]
  activeConversationId: string | null
  loading: boolean
  error: string | null
  search: string
  status: string | undefined
  statuses: string[]
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onClear: () => void
  onOpen: (conversationId: string) => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}) {
  return (
    <section className={isFullscreen
      ? 'fixed inset-0 z-[70] flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#111b21]'
      : 'flex h-[calc(100dvh-130px)] min-h-[620px] w-full flex-col overflow-hidden rounded-[28px] border border-[#1f2c33] bg-[#111b21] shadow-[0_28px_70px_rgba(3,7,18,0.28)] lg:h-195 lg:min-w-75 lg:max-w-sm'}>
      <div className="border-b border-white/5 bg-[#202c33] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8696a0]">Inbox</p>
            <h2 className="mt-1 text-lg font-semibold text-[#e9edef]">Conversaciones</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111b21] text-[#02a698]">
              <MessageIcon />
            </span>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111b21] text-[#cfd4d7] transition hover:bg-[#2a3942] hover:text-white"
              aria-label={isFullscreen ? 'Reducir inbox' : 'Agrandar inbox'}
              title={isFullscreen ? 'Reducir inbox' : 'Agrandar inbox'}
            >
              <FullscreenIcon active={isFullscreen} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-white/5 px-4 py-4">
        <label className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8696a0]">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre, teléfono o etapa"
            className="h-11 w-full rounded-full border border-transparent bg-[#202c33] pl-11 pr-4 text-sm text-[#e9edef] outline-none transition placeholder:text-[#8696a0] focus:border-[#02a698]"
            type="search"
          />
        </label>

        <div className="mt-3 flex gap-2">
          <select
            value={status ?? ''}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-10 flex-1 rounded-full border border-transparent bg-[#202c33] px-4 text-sm text-[#e9edef] outline-none transition focus:border-[#02a698]"
          >
            <option value="">Todos los estados</option>
            {statuses.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-white/10 px-4 text-sm font-medium text-[#e9edef] transition hover:border-[#02a698] hover:text-[#02a698]"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:#2a3942_transparent] [scrollbar-width:thin] pb-20">
        {loading ? (
          <div className="grid min-h-[420px] place-items-center">
            <Loader />
          </div>
        ) : null}

        {!loading && error ? <div className="p-6 text-sm text-rose-300">{error}</div> : null}

        {!loading && !error && rows.length === 0 ? (
          <div className="p-6 text-sm text-[#8696a0]">No hay conversaciones que coincidan con el filtro actual.</div>
        ) : null}

        {!loading && !error
          ? rows.map((conversation) => {
              const isActive = conversation.id === activeConversationId

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onOpen(conversation.id)}
                  className={isActive ? 'flex w-full items-start gap-3 border-b border-white/5 bg-[#202c33] px-4 py-4 text-left' : 'flex w-full items-start gap-3 border-b border-white/5 px-4 py-4 text-left transition hover:bg-[#182229]'}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2a3942] text-sm font-semibold text-[#e9edef]">
                    {conversation.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-[#e9edef]">{conversation.displayName}</p>
                      <span className="shrink-0 text-[11px] text-[#8696a0]">{formatShortDate(conversation.updatedAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[#8696a0]">{conversation.contactWaId || formatLabel(conversation.provider)}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-white/5 px-2 py-1 text-[#02a698]">{formatLabel(conversation.stage)}</span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-[#cfd4d7]">{formatLabel(conversation.status)}</span>
                    </div>
                  </div>
                </button>
              )
            })
          : null}
      </div>
    </section>
  )
}
