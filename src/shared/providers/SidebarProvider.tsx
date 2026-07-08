import { useEffect, useState, type ReactNode } from "react";
import { SidebarContext } from "../context/sidebar-context";


export const SidebarProvider = ({ children }: { children: ReactNode }) => {

  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false)
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize)

  }, [])

  const toggleSidebar = () => setIsExpanded((current) => !current)
  const toggleMobileSidebar = () => setMobileOpen((current) => !current)
  const closeMobileSidebar = () => setMobileOpen(false);

  return <SidebarContext.Provider value={{
    isExpanded,
    isHovered,
    isMobileOpen,
    setIsHovered,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
  }}>
    {children}
  </SidebarContext.Provider>

}