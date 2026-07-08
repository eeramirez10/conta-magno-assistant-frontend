type IconProps = {
  className?: string
}

function IconFrame({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-5.5h5V20" />
    </IconFrame>
  )
}

export function ChatIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 6.8A3.8 3.8 0 0 1 8.8 3h6.4A3.8 3.8 0 0 1 19 6.8v3.9a3.8 3.8 0 0 1-3.8 3.8h-3.7L7 18v-3.5A3.8 3.8 0 0 1 5 11.2Z" />
      <path d="M9 8h6" />
      <path d="M9 11h3.5" />
    </IconFrame>
  )
}

export function BookOpenIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21Z" />
    </IconFrame>
  )
}

export function FolderIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5Z" />
    </IconFrame>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M18.2 13.7a7.2 7.2 0 0 0 .05-1.7l2-1.4-2-3.5-2.4 1a7.3 7.3 0 0 0-1.45-.85L14 4.7h-4l-.4 2.55c-.52.22-1 .5-1.45.85l-2.4-1-2 3.5 2 1.4a7.2 7.2 0 0 0 .05 1.7l-2.05 1.5 2 3.5 2.45-1a7.1 7.1 0 0 0 1.4.8l.4 2.6h4l.4-2.6c.5-.2.96-.48 1.4-.8l2.45 1 2-3.5Z" />
    </IconFrame>
  )
}
