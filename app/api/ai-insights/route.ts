import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateAIInsights } from '@/lib/gemini'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { startDate, endDate, period } = body

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        insights: [{ title: 'Belum Ada Data', description: 'Tambahkan transaksi terlebih dahulu untuk mendapatkan analisis AI yang akurat.', type: 'info' }],
        summary: 'Tidak ada transaksi pada periode ini.',
        healthScore: 0,
      })
    }

    const totalIncome     = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense    = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const totalInvestment = transactions.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0)
    const netCashFlow     = totalIncome - totalExpense - totalInvestment
    const savingsRate     = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

    const expenseByCat: Record<string, { name: string; total: number }> = {}
    const incomeByCat:  Record<string, { name: string; total: number }> = {}
    const investByCat:  Record<string, { name: string; total: number }> = {}

    transactions.forEach(t => {
      const name  = t.category?.name || 'Lainnya'
      const catId = t.category_id   || 'other'
      if (t.type === 'expense') {
        if (!expenseByCat[catId]) expenseByCat[catId] = { name, total: 0 }
        expenseByCat[catId].total += t.amount
      } else if (t.type === 'income') {
        if (!incomeByCat[catId]) incomeByCat[catId] = { name, total: 0 }
        incomeByCat[catId].total += t.amount
      } else {
        if (!investByCat[catId]) investByCat[catId] = { name, total: 0 }
        investByCat[catId].total += t.amount
      }
    })

    const topExpenseCategories = Object.values(expenseByCat).sort((a, b) => b.total - a.total).slice(0, 5)
      .map(c => ({ ...c, percentage: totalExpense > 0 ? (c.total / totalExpense) * 100 : 0 }))
    const topIncomeCategories  = Object.values(incomeByCat).sort((a, b) => b.total - a.total).slice(0, 3)
    const topInvestCategories  = Object.values(investByCat).sort((a, b) => b.total - a.total).slice(0, 3)

    const monthlyTrend = []
    for (let i = 2; i >= 0; i--) {
      const m = subMonths(new Date(), i)
      const ms = format(startOfMonth(m), 'yyyy-MM-dd')
      const me = format(endOfMonth(m),   'yyyy-MM-dd')
      const mt = transactions.filter(t => t.date >= ms && t.date <= me)
      monthlyTrend.push({
        month:      format(m, 'MMM yyyy', { locale: id }),
        income:     mt.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense:    mt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        investment: mt.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
      })
    }

    const rawInsight = await generateAIInsights({
      period: period || 'periode ini',
      totalIncome, totalExpense, totalInvestment, netCashFlow, savingsRate,
      topExpenseCategories, topIncomeCategories: topIncomeCategories as any,
      topInvestmentCategories: topInvestCategories as any,
      monthlyTrend,
    })

    let parsed
    try {
      const cleaned = rawInsight.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = {
        insights: [{ title: 'Analisis Selesai', description: rawInsight, type: 'info' }],
        summary: 'Analisis keuangan berhasil dilakukan.',
        healthScore: 70,
      }
    }

    return NextResponse.json(parsed)
  } catch (error: any) {
    console.error('AI Insights error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate insights' }, { status: 500 })
  }
}
