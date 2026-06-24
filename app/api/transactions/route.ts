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
    const type      = searchParams.get('type')
    const limit     = searchParams.get('limit')

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (startDate) query = query.gte('date', startDate)
    if (endDate)   query = query.lte('date', endDate)
    if (type)      query = query.eq('type', type)
    if (limit)     query = query.limit(parseInt(limit))

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { amount, type, category_id, description, date, notes } = body

    if (!amount || !type || !description || !date)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        amount: parseFloat(amount),
        type,
        category_id: category_id || null,
        description,
        date,
        notes,
      }])
      .select('*, category:categories(*)')
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/transactions:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
