'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Nav from './Nav'

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [checked, setChecked] = useState(false)
  const showNav = pathname !== '/login'

  useEffect(() => {
    let isMounted = true

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!isMounted) return

      const isLoginPage = pathname === '/login'

      if (!user && !isLoginPage) {
        router.replace('/login')
        return
      }

      if (user && isLoginPage) {
        router.replace('/dashboard')
        return
      }

      setChecked(true)
    }

    checkAuth()

    // Re-check whenever auth state changes (e.g. after sign in/out)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const isLoginPage = pathname === '/login'
      if (!session?.user && !isLoginPage) {
        router.replace('/login')
      } else if (session?.user && isLoginPage) {
        router.replace('/dashboard')
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [pathname])

  // Show nothing while we confirm auth status, to avoid flashing
  // protected content before a redirect happens.
  if (!checked && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-sm text-[#6b7280]">Loading...</p>
      </div>
    )
  }

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
