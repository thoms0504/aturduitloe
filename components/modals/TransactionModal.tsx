'use client'
import { useState, useEffect } from 'react'
import { X, Plus, Minus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category, Transaction, TransactionType } from '@/types'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transaction?: Transaction | null
  defaultType?: TransactionType
}

export default function TransactionModal({
  isOpen, onClose, onSuccess, transaction, defaultType = 'expense'
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(defaultType)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      if (transaction) {
        setType(transaction.type)
        setAmount(transaction.amount.toString())
        setCategoryId(transaction.category_id || '')
        setDescription(transaction.description)
        setDate(transaction.date)
        setNotes(transaction.notes || '')
      } else {
        setType(defaultType)
        setAmount('')
        setCategoryId('')
        setDescription('')
        setDate(format(new Date(), 'yyyy-MM-dd'))
        setNotes('')
      }
    }
  }, [isOpen, transaction, defaultType])

  useEffect(() => {
    fetchCategories()
    setCategoryId('')
  }, [type])

  const fetchCategories = async () => {
    const res = await fetch(`/api/categories?type=${type}`)
    const data = await res.json()
    setCategories(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || !date) return toast.error('Lengkapi semua field yang wajib')
    if (parseFloat(amount) <= 0) return toast.error('Jumlah harus lebih dari 0')

    setLoading(true)
    try {
      const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions'
      const method = transaction ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), type, category_id: categoryId || null, description, date, notes }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success(transaction ? 'Transaksi diperbarui!' : 'Transaksi ditambahkan!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Gagal menyimpan transaksi')
    } finally {
      setLoading(false)
    }
  }

  const typeConfig = {
    income: { label: 'Pendapatan', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', icon: Plus },
    expense: { label: 'Pengeluaran', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/50', icon: Minus },
    investment: { label: 'Investasi', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/50', icon: TrendingUp },
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-content relative w-full max-w-md glass-card p-6 shadow-2xl" style={{ boxShadow: 'var(--shadow-modal)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(Object.keys(typeConfig) as TransactionType[]).map(t => {
            const config = typeConfig[t]
            const Icon = config.icon
            const isActive = type === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'py-2.5 rounded-xl text-xs font-medium flex flex-col items-center gap-1.5 border transition-all',
                  isActive
                    ? `${config.bg} ${config.color} ${config.border}`
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-active)] hover:text-[var(--text-secondary)]'
                )}
              >
                <Icon size={16} />
                {config.label}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Jumlah (IDR) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Contoh: 5000000"
              className="input-dark w-full px-4 py-3 text-lg font-semibold font-num"
              min="1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Deskripsi *</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={type === 'income' ? 'Gaji Desember 2025' : type === 'investment' ? 'Beli saham BBCA' : 'Bayar listrik'}
              className="input-dark w-full px-4 py-2.5"
              required
            />
          </div>

          {/* Category and Date in row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Kategori</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="input-dark w-full px-3 py-2.5 text-sm"
              >
                <option value="">Pilih kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Tanggal *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input-dark w-full px-3 py-2.5 text-sm"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
              rows={2}
              className="input-dark w-full px-4 py-2.5 text-sm resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full py-3 rounded-xl font-medium text-sm transition-all',
              type === 'income' ? 'bg-emerald-500 hover:bg-emerald-400' :
              type === 'expense' ? 'bg-rose-500 hover:bg-rose-400' :
              'bg-amber-500 hover:bg-amber-400',
              'text-white disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {loading ? 'Menyimpan...' : transaction ? 'Simpan Perubahan' : `Tambah ${typeConfig[type].label}`}
          </button>
        </form>
      </div>
    </div>
  )
}
