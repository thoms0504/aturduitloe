'use client'
import { useState } from 'react'
import { Sparkles, AlertTriangle, CheckCircle, Info, Lightbulb, RefreshCw, Lock } from 'lucide-react'
import type { AIInsight } from '@/types'
import { cn } from '@/lib/utils'

interface AIInsightsProps {
  startDate: string
  endDate: string
  period: string
}

const insightConfig = {
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  tip: { icon: Lightbulb, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
}

export default function AIInsights({ startDate, endDate, period }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [summary, setSummary] = useState('')
  const [healthScore, setHealthScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)

  const generateInsights = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, period }),
      })
      if (!res.ok) {
        let errMessage = 'Gagal menghasilkan insight'
        try {
          const err = await res.json()
          errMessage = err.error || errMessage
        } catch {
          if (res.status === 504) errMessage = 'Waktu request habis (Timeout). API Gemini butuh waktu terlalu lama.'
          else errMessage = `Terjadi kesalahan pada server (Status: ${res.status})`
        }
        throw new Error(errMessage)
      }
      const data = await res.json()
      setInsights(data.insights || [])
      setSummary(data.summary || '')
      setHealthScore(data.healthScore ?? null)
      setGenerated(true)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = healthScore !== null
    ? healthScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : healthScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400'
    : 'text-[var(--text-muted)]'

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20">
            <Sparkles size={16} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">AI Insight</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
            Gemini
          </span>
        </div>
        {generated && (
          <button
            onClick={generateInsights}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Perbarui
          </button>
        )}
      </div>

      {!generated && !loading ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={22} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-1">Analisis keuangan dengan AI</p>
          <p className="text-xs text-[var(--text-muted)] mb-4 opacity-70">Dapatkan insight dan saran berdasarkan pola transaksi Anda</p>
          <button
            onClick={generateInsights}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Generate Insight
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          <div className="text-center py-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[var(--text-muted)]">Menganalisis pola keuangan...</p>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-[var(--bg-muted)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 justify-center mb-2">
            <Lock size={16} />
            <p className="text-sm">{error}</p>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-3 opacity-70">Pastikan GEMINI_API_KEY sudah dikonfigurasi</p>
          <button
            onClick={generateInsights}
            className="px-4 py-2 rounded-lg bg-[var(--bg-muted)] text-[var(--text-secondary)] text-sm hover:bg-[var(--border)] transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Health score + summary */}
          {(summary || healthScore !== null) && (
            <div className="p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] mb-4">
              {healthScore !== null && (
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--text-muted)]">Skor Kesehatan Keuangan</span>
                  <span className={`text-lg font-bold font-num ${scoreColor}`}>{healthScore}/100</span>
                </div>
              )}
              {summary && <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{summary}</p>}
            </div>
          )}

          {insights.map((insight, i) => {
            const config = insightConfig[insight.type as keyof typeof insightConfig] || insightConfig.info
            const Icon = config.icon
            return (
              <div
                key={i}
                className={cn('p-3 rounded-xl border', config.bg, config.border)}
              >
                <div className="flex items-start gap-2.5">
                  <Icon size={15} className={cn('shrink-0 mt-0.5', config.color)} />
                  <div>
                    <p className={cn('text-xs font-semibold mb-0.5', config.color)}>{insight.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
