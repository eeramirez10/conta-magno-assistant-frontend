import { createPortal } from "react-dom"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Loader } from "../../../shared/components/Loader"
import { MessageIcon } from "../../../shared/components/MessageIcon"
import { SearchIcon } from "../../../shared/components/SearchIcon"
import { formatLabel } from "../../../shared/utils/formatLabel"
import { formatShortDate } from "../../../shared/utils/formatShortDate"
import type { ConversationListItem } from "../types"

type ContextMenuState = {
  conversation: ConversationListItem
  x: number
  y: number
}

function MoreIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
}

function TrashIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

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
  onDeleteRequest,
  onContextMenuStateChange,
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
  onDeleteRequest: (conversation: ConversationListItem) => void
  onContextMenuStateChange: (isOpen: boolean) => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const rowButtonRef = useRef<HTMLButtonElement>(null)
  const contextMenuId = "conversation-context-menu"

  const closeContextMenu = (restoreFocus = true) => {
    setContextMenu(null)
    onContextMenuStateChange(false)
    if (restoreFocus) window.requestAnimationFrame(() => rowButtonRef.current?.focus())
  }

  const openContextMenu = (conversation: ConversationListItem, x: number, y: number) => {
    setContextMenu({ conversation, x, y })
    onContextMenuStateChange(true)
  }

  useLayoutEffect(() => {
    if (!contextMenu || !menuRef.current) return
    const bounds = menuRef.current.getBoundingClientRect()
    const left = Math.max(8, Math.min(contextMenu.x, window.innerWidth - bounds.width - 8))
    const top = Math.max(8, Math.min(contextMenu.y, window.innerHeight - bounds.height - 8))
    menuRef.current.style.left = `${left}px`
    menuRef.current.style.top = `${top}px`
    menuRef.current.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [contextMenu])

  useEffect(() => {
    if (!contextMenu) return

    const closeOnPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) closeContextMenu(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        closeContextMenu()
      }
    }
    const closeOnScroll = () => closeContextMenu(false)

    document.addEventListener("pointerdown", closeOnPointerDown)
    document.addEventListener("keydown", closeOnEscape)
    window.addEventListener("scroll", closeOnScroll, true)
    window.addEventListener("resize", closeOnScroll)
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown)
      document.removeEventListener("keydown", closeOnEscape)
      window.removeEventListener("scroll", closeOnScroll, true)
      window.removeEventListener("resize", closeOnScroll)
    }
    // closeContextMenu intentionally uses the menu state from this effect's render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextMenu])

  return (
    <section className={isFullscreen
      ? 'fixed inset-0 z-[70] flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#111b21]'
      : 'flex h-[calc(100dvh-130px)] min-h-[620px] w-full flex-col overflow-hidden rounded-[28px] border border-[#1f2c33] bg-[#111b21] shadow-[0_28px_70px_rgba(3,7,18,0.28)] lg:h-195 lg:min-w-75 lg:max-w-sm'}>
      <div className="border-b border-white/5 bg-[#202c33] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8696a0]">Inbox</p>
            <h2 tabIndex={-1} data-conversation-list-heading className="mt-1 text-lg font-semibold text-[#e9edef] outline-none">Conversaciones</h2>
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
                <div
                  key={conversation.id}
                  className={`group flex items-stretch border-b border-white/5 pr-2 transition ${isActive ? 'bg-[#202c33]' : 'hover:bg-[#182229]'}`}
                  onContextMenu={(event) => {
                    event.preventDefault()
                    rowButtonRef.current = event.currentTarget.querySelector("[data-conversation-row]")
                    openContextMenu(conversation, event.clientX, event.clientY)
                  }}
                  onKeyDown={(event) => {
                    if (event.currentTarget !== event.target || event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return
                    event.preventDefault()
                    rowButtonRef.current = event.currentTarget.querySelector("[data-conversation-row]")
                    const bounds = event.currentTarget.getBoundingClientRect()
                    openContextMenu(conversation, bounds.left, bounds.bottom)
                  }}
                >
                  <button
                    type="button"
                    data-conversation-row
                    data-conversation-id={conversation.id}
                    onClick={() => onOpen(conversation.id)}
                    onKeyDown={(event) => {
                      if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return
                      event.preventDefault()
                      rowButtonRef.current = event.currentTarget
                      const bounds = event.currentTarget.getBoundingClientRect()
                      openContextMenu(conversation, bounds.left, bounds.bottom)
                    }}
                    aria-haspopup="menu"
                    aria-expanded={contextMenu?.conversation.id === conversation.id}
                    aria-controls={contextMenuId}
                    className="flex min-w-0 flex-1 items-start gap-3 py-4 pl-4 pr-2 text-left"
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
                  <button
                    type="button"
                    data-context-menu-trigger
                    aria-label={`Más opciones para ${conversation.displayName}`}
                    aria-haspopup="menu"
                    aria-expanded={contextMenu?.conversation.id === conversation.id}
                    onClick={(event) => {
                      rowButtonRef.current = event.currentTarget
                      if (contextMenu?.conversation.id === conversation.id) closeContextMenu(false)
                      else openContextMenu(conversation, event.currentTarget.getBoundingClientRect().right, event.currentTarget.getBoundingClientRect().bottom)
                    }}
                    className="my-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#cfd4d7] transition hover:bg-[#2a3942] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#02a698]"
                  >
                    <MoreIcon />
                  </button>
                </div>
              )
            })
          : null}
      </div>
      {contextMenu ? createPortal(
        <div
          ref={menuRef}
          id={contextMenuId}
          role="menu"
          aria-label={`Opciones para ${contextMenu.conversation.displayName}`}
          className="fixed z-[99990] min-w-60 rounded-xl border border-[#34434a] bg-[#202c33] p-1.5 shadow-[0_14px_36px_rgba(0,0,0,0.48)]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              event.stopPropagation()
              closeContextMenu()
            } else if (event.key === "Tab") {
              event.preventDefault()
              closeContextMenu()
            }
          }}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400"
            onClick={() => {
              const selected = contextMenu.conversation
              closeContextMenu(false)
              onDeleteRequest(selected)
            }}
          >
            <TrashIcon />
            <span>Eliminar conversación y contacto</span>
          </button>
        </div>,
        document.body,
      ) : null}
    </section>
  )
}
