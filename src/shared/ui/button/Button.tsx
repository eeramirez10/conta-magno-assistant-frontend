import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  size?: 'sm' | 'md'
  variant?: 'primary' | 'outline' | 'danger'
  startIcon?: ReactNode
  endIcon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-5 py-3 text-sm',
}

const variantClasses = {
  primary: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
  outline: 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
  danger: 'bg-error-600 text-white shadow-theme-xs hover:bg-error-700 disabled:bg-error-300',
}

export default function Button({
  children,
  size = 'md',
  variant = 'primary',
  startIcon,
  endIcon,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${className} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon ? <span className="flex items-center">{startIcon}</span> : null}
      {children}
      {endIcon ? <span className="flex items-center">{endIcon}</span> : null}
    </button>
  )
}
