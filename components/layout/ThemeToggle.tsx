'use client'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export default function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  const iconSize = size === 'sm' ? 14 : 16
  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
      className={`
        ${btnSize} rounded-xl flex items-center justify-center
        transition-all duration-200
        dark:text-white/40 dark:hover:text-yellow-300 dark:hover:bg-yellow-500/10
        text-slate-500 hover:text-indigo-600 hover:bg-indigo-50
        ${className}
      `}
    >
      {theme === 'dark' ? (
        <Sun size={iconSize} />
      ) : (
        <Moon size={iconSize} />
      )}
    </button>
  )
}
