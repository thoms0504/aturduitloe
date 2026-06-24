'use client'
import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, getTypeBg } from '@/lib/utils'
import type { Transaction } from '@/types'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Transaction[]
  loading?: boolean
  onEdit?: (t: Transaction) => void
  onDelete?: (id: string) => void
  showAll?: boolean
}

export default function RecentTransactions({ transactions, loading, onEdit, onDelete, showAll }: RecentTransactionsProps) {
  const displayed = showAll ? transactions : transactions.slice(0, 8)

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="h-5 w-40 bg-[var(--bg-muted)] rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[var(--bg-muted)] rounded-xl animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-[var(--bg-muted)] rounded animate-pulse mb-1.5 w-3/4" />
                <div className="h-3 bg-[var(--border)] rounded animate-pulse w-1/2" />
              </div>
              <div className="h-4 w-20 bg-[var(--bg-muted)] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">
        {showAll ? 'Semua Transaksi' : 'Transaksi Terbaru'}
      </h3>
      {displayed.length === 0 ? (
        <div className="py-10 text-center text-[var(--text-muted)] text-sm">
          <p>Belum ada transaksi</p>
          <p className="text-xs mt-1 opacity-60">Tambahkan transaksi baru</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayed.map(t => (
            <div
              key={t.id}
              className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border"
                style={{
                  background: `${t.category?.color || '#6B7280'}18`,
                  borderColor: `${t.category?.color || '#6B7280'}30`,
                }}
              >
                {t.category?.icon || '💸'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate font-medium">{t.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--text-muted)]">{formatDate(t.date)}</span>
                  {t.category && (
                    <span className="text-xs text-[var(--text-muted)]">· {t.category.name}</span>
                  )}
                  <span className={cn('text-xs px-1.5 py-0.5 rounded-md', getTypeBg(t.type))}>
                    {t.type === 'income' ? 'Masuk' : t.type === 'expense' ? 'Keluar' : 'Investasi'}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className={cn(
                  'text-sm font-semibold font-num',
                  t.type === 'income' ? 'text-emerald-400' :
                  t.type === 'expense' ? 'text-rose-400' : 'text-amber-400'
                )}>
                  {t.type === 'expense' ? '−' : '+'}{formatCurrency(t.amount, true)}
                </p>
              </div>

              {/* Actions */}
              {(onEdit || onDelete) && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(t)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(t.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[var(--text-muted)] hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
