import type { ReactNode } from "react"
import { AppSidebar } from "./AppSidebar"
import { SidebarProvider } from "../providers/SidebarProvider"
import { AppHeader } from "./AppHeader"
import { useSidebar } from "../context/sidebar-context"
import { cn } from "../lib/cn"


function SidebarBackdrop() {
  const { isMobileOpen, closeMobileSidebar } = useSidebar()

  if (!isMobileOpen) return null

  return (
    <button
      type="button"
      className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
      aria-label="Close sidebar"
      onClick={closeMobileSidebar}
    />
  )
}


export const ShellContent = ({ children }: { children: ReactNode }) => {
  const { isExpanded, isHovered } = useSidebar()

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <SidebarBackdrop />
      <AppHeader />
      <main
        className={cn(
          'transition-[margin] duration-300',
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]',
        )}
      >
        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 ">
          {children}
        </div>
      </main>
    </div>
  )
}

export const AppShellFrame = ({ children }: { children: ReactNode }) => {

  return (
    <SidebarProvider>
      <ShellContent> {children}</ShellContent>
    </SidebarProvider>
  )
}
