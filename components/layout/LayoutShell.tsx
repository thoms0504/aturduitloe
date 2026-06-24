'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import ThemeToggle from './ThemeToggle'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

// Routes that should NOT show sidebar
const PUBLIC_ROUTES = ['/login', '/register']

interface LayoutShellProps {
  children: React.ReactNode
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setAuthLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  const showSidebar = !isPublicRoute && !!user && !authLoading

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop + tablet) */}
      {showSidebar && (
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        {showSidebar && (
          <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[var(--bg-sidebar)] border-b border-[var(--bg-sidebar-border)]">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-all"
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
              <span className="font-bold text-sm text-[var(--text-primary)]">AturDuit<span style={{ color: 'var(--accent)' }}>.loe</span></span>
            </div>

            <ThemeToggle size="sm" />
          </header>
        )}

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto ${showSidebar ? 'pb-20 md:pb-0' : ''}`}>
          {children}
        </main>

        {/* Mobile bottom nav */}
        {showSidebar && <MobileNav />}
      </div>
    </div>
  )
}
