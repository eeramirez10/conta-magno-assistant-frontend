import { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  children: React.ReactNode
  showCloseButton?: boolean
  isFullscreen?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const contentClasses = isFullscreen ? 'h-full w-full' : 'relative w-full rounded-3xl bg-white'

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto px-4 py-6">
      {!isFullscreen ? <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[16px]" onClick={onClose} /> : null}
      <div ref={modalRef} className={`${contentClasses} ${className ?? ''}`} onClick={(event) => event.stopPropagation()}>
        {showCloseButton ? (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-999 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:right-6 sm:top-6"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.043 16.541c-.39.39-.39 1.024 0 1.414.391.391 1.024.391 1.414 0L12 13.414l4.542 4.542c.39.39 1.024.39 1.414 0 .39-.39.39-1.024 0-1.414L13.414 12l4.542-4.542c.39-.39.39-1.024 0-1.414-.39-.39-1.024-.39-1.414 0L12 10.586 7.457 6.044c-.39-.39-1.023-.39-1.414 0-.39.39-.39 1.024 0 1.414L10.586 12l-4.543 4.541Z"
                fill="currentColor"
              />
            </svg>
          </button>
        ) : null}
        <div>{children}</div>
      </div>
    </div>
  )
}
