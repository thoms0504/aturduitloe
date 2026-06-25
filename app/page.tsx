'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, subDays, subWeeks, subMonths, subYears, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import toast from 'react-hot-toast'
import type { Transaction, DashboardSummary, ChartDataPoint, CategorySummary, Period } from '@/types'
import SummaryCards from '@/components/dashboard/SummaryCards'
const CashFlowChart = dynamic(() => import('@/components/dashboard/CashFlowChart'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-[var(--bg-muted)] rounded-xl" />
})
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import AIInsights from '@/components/dashboard/AIInsights'
import TransactionModal from '@/components/modals/TransactionModal'
import { cn, formatCurrency } from '@/lib/utils'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Harian' },
  { key: 'weekly', label: 'Mingguan' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'yearly', label: 'Tahunan' },
]

type CategoryTab = 'expense' | 'income' | 'investment'

function getRange(period: Period, offset: number) {
  const now = new Date()
  switch (period) {
    case 'daily': {
      const d = offset === 0 ? now : subDays(now, -offset)
      const base = subDays(now, Math.abs(offset))
      return { start: startOfDay(base), end: endOfDay(base), label: format(base, "EEEE, d MMMM yyyy", { locale: id }) }
    }
    case 'weekly': {
      const base = offset === 0 ? now : (offset < 0 ? subWeeks(now, -offset) : subWeeks(now, offset))
      const actualBase = subWeeks(now, Math.abs(offset) * (offset <= 0 ? 1 : -1))
      const b2 = offset <= 0 ? subWeeks(now, -offset) : subWeeks(now, offset)
      const start = startOfWeek(b2, { weekStartsOn: 1 })
      const end = endOfWeek(b2, { weekStartsOn: 1 })
      return { start, end, label: `${format(start, 'd MMM', { locale: id })} – ${format(end, 'd MMM yyyy', { locale: id })}` }
    }
    case 'monthly': {
      const b = subMonths(now, -offset)
      return { start: startOfMonth(b), end: endOfMonth(b), label: format(b, 'MMMM yyyy', { locale: id }) }
    }
    case 'yearly': {
      const b = subYears(now, -offset)
      return { start: startOfYear(b), end: endOfYear(b), label: format(b, 'yyyy') }
    }
  }
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('monthly')
  const [offset, setOffset] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [categoryTab, setCategoryTab] = useState<CategoryTab>('expense')

  const range = useMemo(() => getRange(period, offset), [period, offset])
  const startStr = format(range.start, 'yyyy-MM-dd')
  const endStr = format(range.end, 'yyyy-MM-dd')

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions?start=${startStr}&end=${endStr}`)
      const data = await res.json()
      setTransactions(data)
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [startStr, endStr])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Reset offset when period changes
  useEffect(() => { setOffset(0) }, [period])

  // Summary calculations
  const summary: DashboardSummary = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalInvestment = transactions.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0)
    const netCashFlow = totalIncome - totalExpense - totalInvestment
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
    return { totalIncome, totalExpense, totalInvestment, netCashFlow, savingsRate }
  }, [transactions])

  // Chart data
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (period === 'daily') {
      const hours = Array.from({ length: 24 }, (_, h) => h)
      return hours.map(h => {
        const hStr = h.toString().padStart(2, '0')
        const dayTx = transactions.filter(t => {
          const txDate = parseISO(t.created_at || t.date)
          return txDate.getHours() === h
        })
        return {
          label: `${hStr}:00`,
          income: dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expense: dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
          investment: dayTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
          net: 0,
        }
      }).filter((_, i) => i % 3 === 0)
    }

    if (period === 'weekly') {
      const days = eachDayOfInterval({ start: range.start, end: range.end })
      return days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd')
        const dayTx = transactions.filter(t => t.date === dayStr)
        return {
          label: format(day, 'EEE', { locale: id }),
          income: dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expense: dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
          investment: dayTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
          net: 0,
        }
      })
    }

    if (period === 'monthly') {
      // Days of month
      const days = eachDayOfInterval({ start: range.start, end: range.end })
      // Group by week of month for readability
      const weeks: Record<number, ChartDataPoint> = {}
      days.forEach(day => {
        const weekNum = Math.ceil(day.getDate() / 7)
        const dayStr = format(day, 'yyyy-MM-dd')
        const dayTx = transactions.filter(t => t.date === dayStr)
        if (!weeks[weekNum]) weeks[weekNum] = { label: `Minggu ${weekNum}`, income: 0, expense: 0, investment: 0, net: 0 }
        dayTx.forEach(t => {
          if (t.type === 'income') weeks[weekNum].income += t.amount
          else if (t.type === 'expense') weeks[weekNum].expense += t.amount
          else if (t.type === 'investment') weeks[weekNum].investment += t.amount
        })
      })
      return Object.values(weeks)
    }

    // Yearly - by month
    const months = Array.from({ length: 12 }, (_, i) => i)
    const year = range.start.getFullYear()
    return months.map(m => {
      const monthTx = transactions.filter(t => {
        const d = parseISO(t.date)
        return d.getMonth() === m && d.getFullYear() === year
      })
      return {
        label: format(new Date(year, m, 1), 'MMM', { locale: id }),
        income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        investment: monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
        net: 0,
      }
    })
  }, [transactions, period, range])

  // Category summaries
  const categorySummaries: CategorySummary[] = useMemo(() => {
    const filtered = transactions.filter(t => t.type === categoryTab)
    const total = filtered.reduce((s, t) => s + t.amount, 0)
    const byCategory: Record<string, CategorySummary> = {}
    filtered.forEach(t => {
      const catId = t.category_id || 'uncategorized'
      if (!byCategory[catId]) {
        byCategory[catId] = {
          category_id: catId,
          category_name: t.category?.name || 'Tidak Berkategori',
          category_icon: t.category?.icon || '💸',
          category_color: t.category?.color || '#6B7280',
          type: t.type,
          total: 0,
          count: 0,
          percentage: 0,
        }
      }
      byCategory[catId].total += t.amount
      byCategory[catId].count++
    })
    return Object.values(byCategory)
      .map(c => ({ ...c, percentage: total > 0 ? (c.total / total) * 100 : 0 }))
      .sort((a, b) => b.total - a.total)
  }, [transactions, categoryTab])

  const handleExport = () => {
    window.open(`/api/export?start=${startStr}&end=${endStr}`, '_blank')
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Transaksi dihapus')
      fetchTransactions()
    } else {
      toast.error('Gagal menghapus transaksi')
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Pantau arus kas keuangan Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] text-sm transition-all"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Tambah Transaksi</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {/* Period selector + navigator */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-[var(--bg-muted)] rounded-xl p-1 border border-[var(--border)]">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                'px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
                period === p.key
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset(o => o - 1)}
            className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs sm:text-sm text-[var(--text-secondary)] min-w-[130px] sm:min-w-[180px] text-center">{range.label}</span>
          <button
            onClick={() => setOffset(o => Math.min(o + 1, 0))}
            disabled={offset >= 0}
            className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards summary={summary} loading={loading} />

      {/* Chart + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <CashFlowChart data={chartData} loading={loading} />
        </div>
        <div>
          <AIInsights startDate={startStr} endDate={endStr} period={range.label} />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Rincian per Kategori</h3>
          <div className="flex gap-1 bg-[var(--bg-muted)] rounded-lg p-1 border border-[var(--border)]">
            {(['expense', 'income', 'investment'] as CategoryTab[]).map(t => (
              <button
                key={t}
                onClick={() => setCategoryTab(t)}
                className={cn(
                  'px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all',
                  categoryTab === t
                    ? t === 'expense' ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400'
                      : t === 'income' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pendapatan' : 'Investasi'}
              </button>
            ))}
          </div>
        </div>

        {categorySummaries.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-muted)] text-sm">Belum ada data untuk kategori ini</div>
        ) : (
          <div className="space-y-2">
            {categorySummaries.map(cat => (
              <div key={cat.category_id} className="flex items-center gap-3 group">
                <span className="text-lg shrink-0">{cat.category_icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--text-secondary)] truncate">{cat.category_name}</span>
                    <span className="text-sm font-semibold font-num text-[var(--text-primary)] ml-2">{formatCurrency(cat.total, true)}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, background: cat.category_color }}
                    />
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] w-12 text-right shrink-0">{cat.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions}
        loading={loading}
        onDelete={handleDeleteTransaction}
      />

      {/* Transaction modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  )
}
