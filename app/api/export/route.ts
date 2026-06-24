import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate   = searchParams.get('end')

    let query = supabase
      .from('transactions')
      .select('*, category:categories(name, type)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (startDate) query = query.gte('date', startDate)
    if (endDate)   query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) throw error

    const typeMap: Record<string, string> = {
      income: 'Pendapatan',
      expense: 'Pengeluaran',
      investment: 'Investasi',
    }

    const rows = [
      ['Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Jumlah (IDR)', 'Catatan'],
      ...(data || []).map(t => [
        t.date,
        typeMap[t.type] || t.type,
        t.category?.name || '-',
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ]),
    ]

    const csv      = rows.map(r => r.join(',')).join('\n')
    const fileName = `aturduit_${startDate || 'all'}_${endDate || 'now'}.csv`

    return new NextResponse('\uFEFF' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 })
  }
}
