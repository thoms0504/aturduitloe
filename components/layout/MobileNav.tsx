'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',             label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi',  icon: ArrowLeftRight  },
  { href: '/investments',  label: 'Investasi',  icon: TrendingUp      },
  { href: '/categories',   label: 'Kategori',   icon: Tag             },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-40 md:hidden',
      'bg-[var(--bg-sidebar)] border-t border-[var(--bg-sidebar-border)]',
      'flex items-center justify-around',
      'px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]'
    )}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[60px]',
              isActive
                ? 'text-indigo-500 dark:text-indigo-400'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
            {isActive && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
