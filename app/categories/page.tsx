'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import type { Category, TransactionType } from '@/types'
import CategoryModal from '@/components/modals/CategoryModal'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const TYPE_TABS: { key: TransactionType; label: string; color: string; activeCls: string }[] = [
  { key: 'income', label: 'Pendapatan', color: 'text-emerald-400', activeCls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { key: 'expense', label: 'Pengeluaran', color: 'text-rose-400', activeCls: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { key: 'investment', label: 'Investasi', color: 'text-amber-400', activeCls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeType, setActiveType] = useState<TransactionType>('expense')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      setCategories(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const filtered = categories.filter(c => c.type === activeType)

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"? Pastikan tidak ada transaksi yang menggunakan kategori ini.`)) return
    const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      toast.success('Kategori dihapus')
      fetchCategories()
    } else {
      toast.error(data.error || 'Gagal menghapus')
    }
  }

  const handleEdit = (cat: Category) => {
    setEditCategory(cat)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditCategory(null)
  }

  const activeTab = TYPE_TABS.find(t => t.key === activeType)!

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Kategori</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Kelola kategori transaksi Anda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
        >
          <Plus size={15} /> <span className="hidden sm:inline">Tambah </span>Kategori
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {TYPE_TABS.map(tab => (
          <div key={tab.key} className="glass-card p-3 sm:p-4 hover-card cursor-pointer" onClick={() => setActiveType(tab.key)}>
            <p className="text-xs text-[var(--text-muted)] mb-1">{tab.label}</p>
            <p className={cn('text-xl sm:text-2xl font-bold', tab.color)}>
              {categories.filter(c => c.type === tab.key).length}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 opacity-60">kategori</p>
          </div>
        ))}
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-0">
        {TYPE_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveType(tab.key)}
            className={cn(
              'px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
              activeType === tab.key
                ? `${tab.color} border-current`
                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
            )}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-60">
              ({categories.filter(c => c.type === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Categories grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="w-10 h-10 bg-[var(--bg-muted)] rounded-xl mb-3" />
              <div className="h-4 bg-[var(--bg-muted)] rounded mb-1.5" />
              <div className="h-3 bg-[var(--border)] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Tag size={32} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-muted)] text-sm">Belum ada kategori {activeTab.label.toLowerCase()}</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] text-sm transition-all"
          >
            Tambah Kategori
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(cat => (
            <div key={cat.id} className="glass-card p-4 hover-card group relative">
              {/* Default badge */}
              {cat.is_default && (
                <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-md bg-[var(--bg-muted)] text-[var(--text-muted)]">
                  Default
                </span>
              )}

              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}30` }}
              >
                {cat.icon}
              </div>

              {/* Name */}
              <p className="text-sm font-medium text-[var(--text-primary)] leading-tight mb-0.5">{cat.name}</p>
              <div className="w-3 h-0.5 rounded-full mt-2" style={{ background: cat.color }} />

              {/* Actions */}
              <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-1.5 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Pencil size={12} />
                </button>
                {!cat.is_default && (
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500/60 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add new card */}
          <button
            onClick={() => setShowModal(true)}
            className="glass-card p-4 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 hover:bg-[var(--bg-muted)] transition-colors min-h-[120px]"
          >
            <div className="w-11 h-11 rounded-xl border border-dashed border-[var(--border-active)] flex items-center justify-center">
              <Plus size={20} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-xs text-[var(--text-muted)]">Tambah Baru</p>
          </button>
        </div>
      )}

      <CategoryModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={fetchCategories}
        category={editCategory}
        defaultType={activeType}
      />
    </div>
  )
}
