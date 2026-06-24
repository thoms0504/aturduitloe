'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Category, TransactionType } from '@/types'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  category?: Category | null
  defaultType?: TransactionType
}

const EMOJI_OPTIONS = ['💼','🎁','✈️','🏆','💻','💰','⚡','💧','⛪','🍽️','🍜','🛒','🚗','🏠','🏥','📖','🎬','📋','📈','📊','💹','🥇','📚','₿','🏦','💎','🎯','🌟','💡','🔑','🎪','🌈','🎸','⚽','🎓','🍕','☕','🚀','🌍','💊','🎁','📱','🖥️','🏋️','🌺']

const COLOR_OPTIONS = ['#10B981','#059669','#34D399','#F59E0B','#EAB308','#3B82F6','#6366F1','#8B5CF6','#EC4899','#EF4444','#F97316','#14B8A6','#F43F5E','#A855F7','#06B6D4','#84CC16','#FCD34D','#818CF8','#9CA3AF','#D946EF']

export default function CategoryModal({ isOpen, onClose, onSuccess, category, defaultType = 'expense' }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionType>(defaultType)
  const [icon, setIcon] = useState('💰')
  const [color, setColor] = useState('#10B981')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name)
        setType(category.type)
        setIcon(category.icon)
        setColor(category.color)
      } else {
        setName('')
        setType(defaultType)
        setIcon('💰')
        setColor('#10B981')
      }
    }
  }, [isOpen, category, defaultType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Nama kategori wajib diisi')

    setLoading(true)
    try {
      const url = category ? `/api/categories/${category.id}` : '/api/categories'
      const method = category ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type, icon, color }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast.success(category ? 'Kategori diperbarui!' : 'Kategori ditambahkan!')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan kategori')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-content relative w-full max-w-md glass-card p-6 shadow-2xl" style={{ boxShadow: 'var(--shadow-modal)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {category ? 'Edit Kategori' : 'Tambah Kategori'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
            <span className="text-3xl">{icon}</span>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">{name || 'Nama Kategori'}</div>
              <div className="text-xs mt-0.5" style={{ color }}>
                {type === 'income' ? 'Pendapatan' : type === 'expense' ? 'Pengeluaran' : 'Investasi'}
              </div>
            </div>
            <div className="ml-auto w-4 h-4 rounded-full" style={{ background: color }} />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Nama Kategori *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Langganan Streaming"
              className="input-dark w-full px-4 py-2.5"
              required
            />
          </div>

          {/* Type (only for new categories) */}
          {!category && (
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Jenis</label>
              <div className="grid grid-cols-3 gap-2">
                {(['income', 'expense', 'investment'] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      'py-2 rounded-lg text-xs font-medium border transition-all',
                      type === t
                        ? t === 'income' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : t === 'expense' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    )}
                  >
                    {t === 'income' ? 'Pendapatan' : t === 'expense' ? 'Pengeluaran' : 'Investasi'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Icon picker */}
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Ikon</label>
            <div className="grid grid-cols-10 gap-1.5 max-h-28 overflow-y-auto pr-1">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={cn(
                    'p-1.5 rounded-lg text-lg transition-all hover:bg-[var(--bg-muted)]',
                    icon === e ? 'bg-[var(--border)] ring-1 ring-[var(--border-active)]' : ''
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Warna</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    color === c ? 'ring-2 ring-[var(--text-primary)] ring-offset-2 ring-offset-[var(--bg-card)] scale-110' : 'hover:scale-105'
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : category ? 'Simpan Perubahan' : 'Tambah Kategori'}
          </button>
        </form>
      </div>
    </div>
  )
}
