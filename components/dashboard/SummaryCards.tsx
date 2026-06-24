'use client'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { DashboardSummary } from '@/types'

interface SummaryCardsProps {
  summary: DashboardSummary
  loading?: boolean
}

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Pendapatan',
      value: summary.totalIncome,
      icon: TrendingUp,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.25)',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Total Pengeluaran',
      value: summary.totalExpense,
      icon: TrendingDown,
      color: '#F43F5E',
      bg: 'rgba(244,63,94,0.12)',
      border: 'rgba(244,63,94,0.25)',
      textColor: 'text-rose-400',
    },
    {
      label: 'Total Investasi',
      value: summary.totalInvestment,
      icon: PiggyBank,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      border: 'rgba(245,158,11,0.25)',
      textColor: 'text-amber-400',
    },
    {
      label: 'Arus Kas Bersih',
      value: summary.netCashFlow,
      icon: Wallet,
      color: summary.netCashFlow >= 0 ? '#6366F1' : '#F43F5E',
      bg: summary.netCashFlow >= 0 ? 'rgba(99,102,241,0.12)' : 'rgba(244,63,94,0.12)',
      border: summary.netCashFlow >= 0 ? 'rgba(99,102,241,0.25)' : 'rgba(244,63,94,0.25)',
      textColor: summary.netCashFlow >= 0 ? 'text-indigo-400' : 'text-rose-400',
    },
  ]

  const Skeleton = () => (
    <div className="h-5 bg-[var(--bg-muted)] rounded-lg animate-pulse" />
  )

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Main summary - gradient border */}
      <div className="col-span-2 lg:col-span-4 gradient-border p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">Ringkasan Periode</p>
            {loading ? <Skeleton /> : (
              <div className="flex items-baseline gap-3">
                <span className={`text-2xl sm:text-3xl font-bold font-num ${summary.netCashFlow >= 0 ? 'text-indigo-500 dark:text-indigo-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {formatCurrency(summary.netCashFlow)}
                </span>
                {summary.netCashFlow >= 0 ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm">
                    <ArrowUpRight size={16} /> Surplus
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 text-sm">
                    <ArrowDownRight size={16} /> Defisit
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-1">Pendapatan dikurangi pengeluaran &amp; investasi</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)]">Tingkat Tabungan</p>
              {loading ? <div className="h-6 w-16 bg-[var(--bg-muted)] rounded animate-pulse mt-1" /> : (
                <p className={`text-xl font-bold font-num mt-0.5 ${summary.savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : summary.savingsRate >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400'}`}>
                  {summary.savingsRate.toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Individual cards */}
      {cards.slice(0, 3).map(card => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="glass-card p-4 hover-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                <Icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-1">{card.label}</p>
            {loading ? <Skeleton /> : (
              <p className={`text-lg sm:text-xl font-bold font-num ${card.textColor}`}>
                {formatCurrency(card.value, true)}
              </p>
            )}
          </div>
        )
      })}

      {/* Savings rate / net card */}
      <div className="glass-card p-4 hover-card">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-xl" style={{ background: cards[3].bg, border: `1px solid ${cards[3].border}` }}>
            <Wallet size={18} style={{ color: cards[3].color }} />
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-1">Arus Kas Bersih</p>
        {loading ? <Skeleton /> : (
          <p className={`text-lg sm:text-xl font-bold font-num ${cards[3].textColor}`}>
            {formatCurrency(summary.netCashFlow, true)}
          </p>
        )}
      </div>
    </div>
  )
}
