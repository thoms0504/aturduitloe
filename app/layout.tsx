import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import LayoutShell from '@/components/layout/LayoutShell'

export const metadata: Metadata = {
  title: 'AturDuit.loe — Atur. Pantau. Berkembang.',
  description: 'Kelola keuangan pribadi dengan cerdas — tracking pemasukan, pengeluaran & investasi kamu.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="mesh-bg min-h-screen">
        <ThemeProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10B981', secondary: 'var(--toast-bg)' } },
              error: { iconTheme: { primary: '#F43F5E', secondary: 'var(--toast-bg)' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
