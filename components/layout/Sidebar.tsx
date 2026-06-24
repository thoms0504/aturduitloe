'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Tag, BarChart3, LogOut, User, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase-browser'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { href: '/',             label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi',  icon: ArrowLeftRight  },
  { href: '/investments',  label: 'Investasi',  icon: TrendingUp      },
  { href: '/categories',   label: 'Kategori',   icon: Tag             },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()
  const [email, setEmail] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Berhasil keluar')
    router.push('/login')
    router.refresh()
  }

  const SidebarContent = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 border-b px-4 py-5',
        'border-[var(--bg-sidebar-border)]',
        isCollapsed && 'justify-center px-3'
      )}>
        <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl shrink-0 object-cover shadow-sm" />
        {!isCollapsed && (
          <div className="min-w-0">
            <div className="font-bold text-sm leading-tight text-[var(--text-primary)]">AturDuit</div>
            <div className="text-xs font-medium" style={{ color: 'var(--accent)' }}>.loe</div>
          </div>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1 rounded-lg hidden lg:flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-all"
            title="Collapse sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 p-1.5 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-all"
          title="Expand sidebar"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Nav */}
      <nav className={cn('flex-1 py-4 space-y-1', isCollapsed ? 'px-2' : 'px-3')}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              title={isCollapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150',
                isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5',
                isActive
                  ? 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border-r-2 border-indigo-500'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        'border-t space-y-1 py-4',
        'border-[var(--bg-sidebar-border)]',
        isCollapsed ? 'px-2' : 'px-3'
      )}>
        {/* Theme toggle */}
        <div className={cn('flex', isCollapsed ? 'justify-center' : 'px-1')}>
          <ThemeToggle size="sm" />
        </div>

        {/* User email */}
        {email && !isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-muted)]">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <User size={13} className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <span className="text-xs text-[var(--text-muted)] truncate">{email}</span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Keluar' : undefined}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl text-sm transition-all',
            'text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10',
            isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'
          )}
        >
          <LogOut size={16} className="shrink-0" />
          {!isCollapsed && 'Keluar'}
        </button>

        {/* Footer text */}
        {!isCollapsed && (
          <div className="px-3 pt-1">
            <div className="flex items-center gap-2">
              <div className="pulse-dot shrink-0" />
              <span className="text-xs text-[var(--text-muted)] opacity-50">© 2025 AturDuit.loe</span>
            </div>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* ── DESKTOP sidebar (lg+) ── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 shrink-0',
          'bg-[var(--bg-sidebar)] border-r border-[var(--bg-sidebar-border)]',
          'transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {/* ── TABLET sidebar (md–lg) ── */}
      <aside className={cn(
        'hidden md:flex lg:hidden flex-col h-screen sticky top-0 shrink-0 w-16',
        'bg-[var(--bg-sidebar)] border-r border-[var(--bg-sidebar-border)]'
      )}>
        <SidebarContent isCollapsed={true} />
      </aside>

      {/* ── MOBILE drawer overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* drawer */}
          <aside className={cn(
            'relative w-72 h-full flex flex-col',
            'bg-[var(--bg-sidebar)]',
            'animate-[slide-in-right_0.25s_ease]'
          )} style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}>
            {/* Close btn */}
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-all"
            >
              <X size={18} />
            </button>
            <SidebarContent isCollapsed={false} />
          </aside>
        </div>
      )}
    </>
  )
}
