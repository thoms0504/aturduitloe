import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Period } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 1,
      notation: 'compact',
    }).format(amount)
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'd MMM yyyy', { locale: id })
}

export function formatDateShort(dateStr: string): string {
  return format(new Date(dateStr), 'd MMM', { locale: id })
}

export function getPeriodRange(period: Period, offset = 0): { start: Date; end: Date; label: string } {
  const now = new Date()
  switch (period) {
    case 'daily': {
      const d = subDays(now, offset)
      return { start: startOfDay(d), end: endOfDay(d), label: format(d, 'EEEE, d MMMM yyyy', { locale: id }) }
    }
    case 'weekly': {
      const d = subWeeks(now, offset)
      const start = startOfWeek(d, { weekStartsOn: 1 })
      const end = endOfWeek(d, { weekStartsOn: 1 })
      return { start, end, label: `${format(start, 'd MMM', { locale: id })} - ${format(end, 'd MMM yyyy', { locale: id })}` }
    }
    case 'monthly': {
      const d = subMonths(now, offset)
      return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, 'MMMM yyyy', { locale: id }) }
    }
    case 'yearly': {
      const d = subYears(now, offset)
      return { start: startOfYear(d), end: endOfYear(d), label: format(d, 'yyyy') }
    }
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'income': return '#10B981'
    case 'expense': return '#F43F5E'
    case 'investment': return '#F59E0B'
    default: return '#6B7280'
  }
}

export function getTypeBg(type: string): string {
  switch (type) {
    case 'income': return 'bg-emerald-500/10 text-emerald-400'
    case 'expense': return 'bg-rose-500/10 text-rose-400'
    case 'investment': return 'bg-amber-500/10 text-amber-400'
    default: return 'bg-gray-500/10 text-gray-400'
  }
}

export function getTypeLabel(type: string): string {
  switch (type) {
    case 'income': return 'Pendapatan'
    case 'expense': return 'Pengeluaran'
    case 'investment': return 'Investasi'
    default: return type
  }
}
