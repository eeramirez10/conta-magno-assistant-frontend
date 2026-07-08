import Badge from "../../../shared/ui/badge/Badge";
import { formatDateTime } from "../../../shared/utils/formatDateTime";
import { formatLabel } from "../../../shared/utils/formatLabel";
import { statusColor } from "../../../shared/utils/statusColor";
import type { ConversationDetail } from "../types";

export function ConversationMetaPanel({ conversation }: { conversation: ConversationDetail | null }) {
  return (
    <aside className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ficha del lead</p>
        {conversation ? (
          <>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                {conversation.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-slate-950">{conversation.displayName}</h3>
                <p className="truncate text-sm text-slate-500">{conversation.contactPhone || 'Sin teléfono confirmado'}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Estado</dt>
                <dd className="mt-2">
                  <Badge size="sm" color={statusColor(conversation.status)}>
                    {formatLabel(conversation.status)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Etapa</dt>
                <dd className="mt-2 text-sm text-slate-700">{formatLabel(conversation.stage)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Proveedor</dt>
                <dd className="mt-2 text-sm text-slate-700">{formatLabel(conversation.provider)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Creada</dt>
                <dd className="mt-2 text-sm text-slate-700">{formatDateTime(conversation.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Última actividad</dt>
                <dd className="mt-2 text-sm text-slate-700">{formatDateTime(conversation.updatedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mensajes</dt>
                <dd className="mt-2 text-sm text-slate-700">{conversation.messages.length}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="mt-5 text-sm leading-6 text-slate-500">
            Elige una conversación para ver los datos principales del lead y su contexto operativo.
          </p>
        )}
      </div>

      <div className="rounded-[28px] border border-[#b6efe6] bg-[#f0fffb] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#008069]">Siguiente integración</p>
        <h3 className="mt-3 text-lg font-semibold text-slate-950">Respuesta humana desde el panel</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Esta vista ya quedó estructurada para leer mensajes y seleccionar leads. El siguiente paso natural en backend es exponer un endpoint para enviar mensajes OUT por la misma cuenta de WhatsApp Business conectada a Meta.
        </p>
      </div>
    </aside>
  )
}