import { Outlet } from 'react-router'
import { AppShellFrame } from '../shared/layout/AppShellFrame'

export const AppShell = () => {
  return (
    <>
      <AppShellFrame>
        <Outlet />
      </AppShellFrame>
    </>
  )
}
