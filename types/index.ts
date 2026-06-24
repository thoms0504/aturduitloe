export type TransactionType = 'income' | 'expense' | 'investment'

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category_id: string | null
  category?: Category
  description: string
  date: string
  notes?: string
  created_at: string
}

export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  totalInvestment: number
  netCashFlow: number
  savingsRate: number
}

export interface ChartDataPoint {
  label: string
  income: number
  expense: number
  investment: number
  net: number
}

export interface CategorySummary {
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  type: TransactionType
  total: number
  count: number
  percentage: number
}

export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface AIInsight {
  title: string
  description: string
  type: 'warning' | 'success' | 'info' | 'tip'
}
