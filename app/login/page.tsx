'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, BarChart3, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Isi email dan password')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes('Invalid login')) toast.error('Email atau password salah')
        else if (error.message.includes('Email not confirmed')) toast.error('Email belum dikonfirmasi. Cek inbox Anda.')
        else toast.error(error.message)
        return
      }
      toast.success('Berhasil masuk!')
      router.push(redirect)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mesh-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="AturDuit Logo" className="w-14 h-14 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30 object-cover" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            AturDuit<span style={{ color: 'var(--accent)' }}>.loe</span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Masuk ke akun Anda</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-7">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="anda@email.com"
                className="input-dark w-full px-4 py-3"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark w-full px-4 py-3 pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Belum punya akun?{' '}
              <Link href="/register" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] opacity-60 mt-6">
          Data keuangan Anda tersimpan secara privat &amp; aman
        </p>
      </div>
    </div>
  )
}
