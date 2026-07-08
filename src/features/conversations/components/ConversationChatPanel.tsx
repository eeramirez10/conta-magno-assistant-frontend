import { useState, type FormEvent } from "react"
import { Loader } from "../../../shared/components/Loader"
import { MessageIcon } from "../../../shared/components/MessageIcon"
import { SendIcon } from "../../../shared/components/SendIcon"
import { formatDayLabel } from "../../../shared/utils/formatDayLable"
import { formatLabel } from "../../../shared/utils/formatLabel"
import { isSameDay } from "../../../shared/utils/isSameDay"
import type { ConversationDetail } from "../types"
import { MessageBubble } from "./MessageBubble"

export function ConversationChatPanel({
  conversation,
  loading,
  error,
  actionLoading,
  actionError,
  onTakeControl,
  onReleaseControl,
  onSendMessage,
}: {
  conversation: ConversationDetail | null
  loading: boolean
  error: string | null
  actionLoading: boolean
  actionError: string | null
  onTakeControl: () => Promise<void>
  onReleaseControl: () => Promise<void>
  onSendMessage: (text: string) => Promise<void>
}) {
  const [messageText, setMessageText] = useState("")
  const hasHumanControl = conversation?.stage === "PENDING_HUMAN"

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const text = messageText.trim()
    if (!text || !hasHumanControl || actionLoading) return

    try {
      await onSendMessage(text)
      setMessageText("")
    } catch {
      // The action error is rendered below the composer.
    }
  }

  return (
    <section className="flex h-195 w-full flex-col overflow-y-auto rounded-[28px] border border-[#1f2c33] bg-[#0b141a] shadow-[0_28px_70px_rgba(3,7,18,0.3)]">
      {conversation ? (
        <div className="flex items-center justify-between gap-4 border-b border-white/5 bg-[#202c33] px-6 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2a3942] text-sm font-semibold text-[#e9edef]">
              {conversation.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#e9edef]">{conversation.displayName}</p>
              <p className="truncate text-xs text-[#8696a0]">
                {conversation.contactPhone || 'Sin teléfono confirmado'} · {formatLabel(conversation.provider)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#02a698]">{formatLabel(conversation.stage)}</span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#cfd4d7]">{formatLabel(conversation.status)}</span>
            </div>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                void (hasHumanControl ? onReleaseControl() : onTakeControl()).catch(() => undefined)
              }}
              className="rounded-full bg-[#00a884] px-4 py-2 text-xs font-semibold text-[#071b17] transition hover:bg-[#06cf9c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading
                ? "Procesando..."
                : hasHumanControl
                  ? "Liberar control"
                  : "Tomar control"}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-b border-white/5 bg-[#202c33] px-6 py-4">
          <p className="text-sm text-[#8696a0]">Centro de mensajes</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto [scrollbar-color:#2a3942_transparent] [scrollbar-width:thin] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(135deg,#0b141a_0%,#10232b_100%)] bg-[size:22px_22px,22px_22px,100%_100%] px-5 py-6">
        {loading ? (
          <div className="grid h-full min-h-[420px] place-items-center">
            <Loader />
          </div>
        ) : null}

        {!loading && error ? <div className="text-sm text-rose-300">{error}</div> : null}

        {!loading && !error && !conversation ? (
          <div className="grid h-full min-h-[420px] place-items-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-[#02a698]">
                <MessageIcon />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#e9edef]">Selecciona una conversación</h3>
              <p className="mt-3 text-sm leading-6 text-[#8696a0]">
                La vista ya quedó lista para leer contexto, revisar la etapa del lead y preparar la futura respuesta humana desde el panel.
              </p>
            </div>
          </div>
        ) : null}

        {!loading && !error && conversation ? (
          <div className="space-y-4">
            {conversation.messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-4 text-sm text-[#8696a0]">
                Esta conversación todavía no tiene mensajes registrados.
              </div>
            ) : null}

            {conversation.messages.map((message, index) => {
              const previousMessage = conversation.messages[index - 1]
              const showDateDivider = !previousMessage || !isSameDay(previousMessage.createdAt, message.createdAt)

              return (
                <div key={message.id} className="space-y-3">
                  {showDateDivider ? (
                    <div className="flex justify-center">
                      <span className="rounded-full bg-[#182229] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#cfd4d7]">
                        {formatDayLabel(message.createdAt)}
                      </span>
                    </div>
                  ) : null}
                  <MessageBubble message={message} />
                </div>
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/5 bg-[#202c33] px-5 py-4">
        <form className="rounded-[24px] bg-[#111b21] p-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#8696a0]">
              <SendIcon />
            </div>
            <div className="min-w-0 flex-1">
              <input
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                disabled={!hasHumanControl || actionLoading}
                className="h-12 w-full rounded-full border border-transparent bg-[#202c33] px-5 text-sm text-[#cfd4d7] outline-none placeholder:text-[#8696a0]"
                placeholder={
                  hasHumanControl
                    ? "Escribe un mensaje"
                    : "Toma el control para responder"
                }
                type="text"
                maxLength={4000}
              />
            </div>
            <button
              type="submit"
              disabled={!hasHumanControl || actionLoading || messageText.trim().length === 0}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#02a698] text-[#0b141a] transition hover:bg-[#06cf9c] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Enviar mensaje"
            >
              <SendIcon />
            </button>
          </div>
          {actionError ? (
            <p className="mt-3 text-xs leading-5 text-rose-300">{actionError}</p>
          ) : (
            <p className="mt-3 text-xs leading-5 text-[#8696a0]">
              {hasHumanControl
                ? "Control humano activo. El asistente no responderá mientras mantengas el control."
                : "El asistente tiene el control de esta conversación."}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
