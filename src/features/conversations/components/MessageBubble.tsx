import { formatTime } from "../../../shared/utils/formatTime"
import type { ConversationMessage } from "../types"
import { BubbleTail } from "./BubbleTail"

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const outgoing = message.direction === 'OUT'

  return (
    <div className={outgoing ? 'flex justify-end' : 'flex justify-start'}>
      <div className={outgoing ? 'flex max-w-[82%] items-start gap-0' : 'flex max-w-[82%] flex-row-reverse items-start gap-0'}>
        <BubbleTail outgoing={outgoing} />
        <div className={outgoing ? 'rounded-[18px] rounded-tr-sm bg-[#008069] px-4 py-3 text-[#e9edef] shadow-[0_10px_24px_rgba(0,0,0,0.18)]' : 'rounded-[18px] rounded-tl-sm bg-[#233138] px-4 py-3 text-[#e9edef] shadow-[0_10px_24px_rgba(0,0,0,0.18)]'}>
          <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
          <div className="mt-2 flex justify-end text-[11px] text-white/70">{formatTime(message.createdAt)}</div>
        </div>
      </div>
    </div>
  )
}
