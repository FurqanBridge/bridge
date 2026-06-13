'use client'

import { usePathname } from 'next/navigation'
import Nav from './Nav'

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = pathname !== '/login'

  return (
    <div className="flex">
      {/* Sidebar (desktop only, hidden on login) */}
      {showNav && <Nav />}

      {/* Main content — offset by sidebar width on desktop */}
      <div className={`flex-1 ${showNav ? 'md:ml-56 pb-20 md:pb-0' : ''}`}>
        {children}
      </div>
    </div>
  )
}
