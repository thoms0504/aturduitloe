'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, Download } from 'lucide-react'
import type { Transaction, TransactionType, Category } from '@/types'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import TransactionModal from '@/components/modals/TransactionModal'
import toast from 'react-hot-toast'
import { cn, formatCurrency, getTypeLabel } from '@/lib/utils'
import { format } from 'date-fns'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [txRes, catRes] = await Promise.all([
        fetch(`/api/transactions?start=${startDate}&end=${endDate}`),
        fetch('/api/categories'),
      ])
      setTransactions(await txRes.json())
      setCategories(await catRes.json())
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = transactions.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (categoryFilter && t.category_id !== categoryFilter) return false
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totals = {
    income: filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    investment: filtered.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Transaksi dihapus'); fetchData() }
    else toast.error('Gagal menghapus')
  }

  const handleEdit = (t: Transaction) => { setEditTransaction(t); setShowModal(true) }
  const handleCloseModal = () => { setShowModal(false); setEditTransaction(null) }
  const handleExport = () => window.open(`/api/export?start=${startDate}&end=${endDate}`, '_blank')

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Transaksi</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Kelola semua transaksi keuangan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] text-sm transition-all">
            <Download size={15} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all">
            <Plus size={15} /> Tambah
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { type: 'income', label: 'Pendapatan', value: totals.income, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { type: 'expense', label: 'Pengeluaran', value: totals.expense, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
          { type: 'investment', label: 'Investasi', value: totals.investment, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(item => (
          <div key={item.type} className={cn('glass-card p-3 sm:p-4 border', item.bg)}>
            <p className="text-xs text-[var(--text-muted)] mb-1">{item.label}</p>
            <p className={cn('text-base sm:text-lg font-bold font-num', item.color)}>{formatCurrency(item.value, true)}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 opacity-70">{filtered.filter(t => t.type === item.type).length} transaksi</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari transaksi..."
              className="input-dark w-full pl-9 pr-4 py-2 text-sm"
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-dark px-3 py-2 text-sm" />
            <span className="text-[var(--text-muted)] text-xs">s/d</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-dark px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Type filter */}
          <div className="flex gap-1 bg-[var(--bg-muted)] rounded-lg p-1">
            {(['all', 'income', 'expense', 'investment'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all',
                  typeFilter === t ? 'bg-indigo-600 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                {t === 'all' ? 'Semua' : getTypeLabel(t)}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input-dark px-3 py-1.5 text-xs"
          >
            <option value="">Semua Kategori</option>
            {categories
              .filter(c => typeFilter === 'all' || c.type === typeFilter)
              .map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>

          <span className="text-xs text-[var(--text-muted)] self-center ml-auto">
            {filtered.length} transaksi ditemukan
          </span>
        </div>
      </div>

      {/* Transactions list */}
      <RecentTransactions
        transactions={filtered}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showAll
      />

      <TransactionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={fetchData}
        transaction={editTransaction}
      />
    </div>
  )
}
