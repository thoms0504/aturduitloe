'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, BarChart3, UserPlus, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Isi semua field')
    if (password.length < 6) return toast.error('Password minimal 6 karakter')
    if (password !== confirmPassword) return toast.error('Password tidak cocok')

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Email sudah terdaftar. Silakan login.')
        } else {
          toast.error(error.message)
        }
        return
      }
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 mesh-bg">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Cek Email Anda!</h2>
          <p className="text-[var(--text-muted)] text-sm mb-1">
            Link konfirmasi telah dikirim ke:
          </p>
          <p className="text-indigo-500 dark:text-indigo-400 font-medium mb-6">{email}</p>
          <p className="text-[var(--text-muted)] text-xs mb-6 opacity-70">
            Klik link di email untuk mengaktifkan akun, lalu login.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
          >
            Ke Halaman Login
          </Link>
        </div>
      </div>
    )
  }

  const passwordStrength = password.length === 0 ? null : password.length < 6 ? 'weak' : password.length < 10 ? 'medium' : 'strong'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mesh-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="AturDuit Logo" className="w-14 h-14 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30 object-cover" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Buat Akun</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Mulai tracking keuangan Anda</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-7">
          <form onSubmit={handleRegister} className="space-y-4">
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
                  placeholder="Minimal 6 karakter"
                  className="input-dark w-full px-4 py-3 pr-11"
                  autoComplete="new-password"
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
              {/* Password strength indicator */}
              {passwordStrength && (
                <div className="flex gap-1 mt-2">
                  {['weak', 'medium', 'strong'].map((level, i) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background: passwordStrength === 'weak' && i === 0 ? '#F43F5E'
                          : passwordStrength === 'medium' && i <= 1 ? '#F59E0B'
                          : passwordStrength === 'strong' ? '#10B981'
                          : 'rgba(255,255,255,0.1)'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1.5 block">Konfirmasi Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="input-dark w-full px-4 py-3"
                style={{
                  borderColor: confirmPassword && confirmPassword !== password ? 'rgba(244,63,94,0.5)' : undefined
                }}
                autoComplete="new-password"
                required
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">Password tidak cocok</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? 'Memproses...' : 'Buat Akun'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] opacity-60 mt-6">
          Data keuangan Anda tersimpan secara privat & aman
        </p>
      </div>
    </div>
  )
}
