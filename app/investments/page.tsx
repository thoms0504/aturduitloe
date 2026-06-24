'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, TrendingUp } from 'lucide-react'
import type { Transaction, CategorySummary } from '@/types'
import TransactionModal from '@/components/modals/TransactionModal'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { format } from 'date-fns'

export default function InvestmentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/transactions?type=investment')
      setTransactions(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const total = transactions.reduce((s, t) => s + t.amount, 0)

  const byCategory: CategorySummary[] = (() => {
    const map: Record<string, CategorySummary> = {}
    transactions.forEach(t => {
      const catId = t.category_id || 'other'
      if (!map[catId]) {
        map[catId] = {
          category_id: catId,
          category_name: t.category?.name || 'Lainnya',
          category_icon: t.category?.icon || '💰',
          category_color: t.category?.color || '#6B7280',
          type: 'investment',
          total: 0,
          count: 0,
          percentage: 0,
        }
      }
      map[catId].total += t.amount
      map[catId].count++
    })
    return Object.values(map)
      .map(c => ({ ...c, percentage: total > 0 ? (c.total / total) * 100 : 0 }))
      .sort((a, b) => b.total - a.total)
  })()

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus investasi ini?')) return
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Investasi dihapus'); fetchData() }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Investasi</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Pantau portofolio investasi Anda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all"
        >
          <Plus size={15} /> <span className="hidden sm:inline">Catat</span> Investasi
        </button>
      </div>

      {/* Total */}
      <div className="gradient-border p-4 sm:p-5">
        <p className="text-sm text-[var(--text-muted)] mb-1">Total Investasi (Semua Waktu)</p>
        <p className="text-2xl sm:text-3xl font-bold text-amber-500 dark:text-amber-400 font-num">{formatCurrency(total)}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">{transactions.length} transaksi investasi</p>
      </div>

      {/* Portfolio breakdown */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">Alokasi Portofolio</h3>
        {byCategory.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-muted)] text-sm">Belum ada data investasi</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Pie chart */}
            <div className="shrink-0">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="total"
                  >
                    {byCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.category_color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)' }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                    itemStyle={{ color: '#F59E0B' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3 w-full">
              {byCategory.map(cat => (
                <div key={cat.category_id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{cat.category_icon}</span>
                      <span className="text-sm text-[var(--text-secondary)]">{cat.category_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold font-num text-[var(--text-primary)]">{formatCurrency(cat.total, true)}</span>
                      <span className="text-xs text-[var(--text-muted)] ml-2">{cat.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.percentage}%`, background: cat.category_color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent investments */}
      <RecentTransactions
        transactions={transactions}
        loading={loading}
        onEdit={t => { setEditTx(t); setShowModal(true) }}
        onDelete={handleDelete}
        showAll
      />

      <TransactionModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditTx(null) }}
        onSuccess={fetchData}
        transaction={editTx}
        defaultType="investment"
      />
    </div>
  )
}
