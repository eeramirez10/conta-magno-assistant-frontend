import { createContext, useContext } from "react"

export type SidebarContextValue = {
  isExpanded: boolean
  isHovered: boolean
  isMobileOpen: boolean
  setIsHovered: (value: boolean) => void
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
}


export const SidebarContext = createContext<SidebarContextValue | null>(null)

export const useSidebar = () => {

  const context = useContext(SidebarContext)

  if(!context) throw new Error('useSidebar must be used within SidebarProvider')

    return context
}