'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { CategorySummary } from '@/types'

interface CategoryBreakdownProps {
  data: CategorySummary[]
  type: 'income' | 'expense' | 'investment'
  loading?: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-[#0F1929] border border-white/10 rounded-xl p-3 shadow-xl text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span>{item.category_icon}</span>
          <span className="text-white font-medium">{item.category_name}</span>
        </div>
        <div className="text-white/60">{formatCurrency(item.total)}</div>
        <div style={{ color: item.category_color }}>{item.percentage.toFixed(1)}%</div>
      </div>
    )
  }
  return null
}

export default function CategoryBreakdown({ data, type, loading }: CategoryBreakdownProps) {
  const typeLabel = type === 'income' ? 'Pendapatan' : type === 'expense' ? 'Pengeluaran' : 'Investasi'

  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="h-5 w-36 bg-white/10 rounded animate-pulse mb-4" />
        <div className="flex gap-4">
          <div className="w-32 h-32 bg-white/5 rounded-full animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasData = data && data.length > 0

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white/80 mb-4">Per Kategori — {typeLabel}</h3>
      {!hasData ? (
        <div className="h-32 flex items-center justify-center text-white/30 text-sm">
          Belum ada data
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Pie */}
          <div className="flex justify-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={data.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="total"
                >
                  {data.slice(0, 8).map((entry, i) => (
                    <Cell key={i} fill={entry.category_color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend list */}
          <div className="space-y-2">
            {data.slice(0, 6).map((item) => (
              <div key={item.category_id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">{item.category_icon}</span>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.category_color }} />
                  <span className="text-xs text-white/60 truncate">{item.category_name}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-num font-medium text-white/80">{formatCurrency(item.total, true)}</div>
                  <div className="text-xs text-white/30">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
            {data.length > 6 && (
              <p className="text-xs text-white/30 text-center">+{data.length - 6} kategori lainnya</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
