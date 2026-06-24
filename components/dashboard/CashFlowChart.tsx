'use client'
import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { ChartDataPoint } from '@/types'

interface CashFlowChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 shadow-2xl" style={{ minWidth: 140 }}>
        <p className="text-xs text-[var(--text-muted)] mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-[var(--text-muted)]">{entry.name}:</span>
            <span className="font-semibold font-num" style={{ color: entry.color }}>
              {formatCurrency(entry.value, true)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function CashFlowChart({ data, loading }: CashFlowChartProps) {
  const hasData = data && data.length > 0 && data.some(d => d.income > 0 || d.expense > 0 || d.investment > 0)

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}Jt`
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}Rb`
    return value.toString()
  }

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="h-6 w-40 bg-[var(--bg-muted)] rounded animate-pulse mb-4" />
        <div className="h-[280px] bg-[var(--bg-muted)] rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">Grafik Arus Kas</h3>
      {!hasData ? (
        <div className="h-[280px] flex items-center justify-center text-[var(--text-muted)] text-sm">
          Belum ada data untuk periode ini
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)', paddingTop: '10px' }}
              formatter={(value) => value === 'income' ? 'Pendapatan' : value === 'expense' ? 'Pengeluaran' : 'Investasi'}
            />
            <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fill="url(#incomeGrad)" name="income" />
            <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={2} fill="url(#expenseGrad)" name="expense" />
            <Area type="monotone" dataKey="investment" stroke="#F59E0B" strokeWidth={2} fill="url(#investGrad)" name="investment" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
