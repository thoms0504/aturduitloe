import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Return default categories + user's custom categories
    let query = supabase
      .from('categories')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${user.id}`)
      .order('is_default', { ascending: false })
      .order('name')

    if (type) query = query.eq('type', type)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, type, icon, color } = body

    if (!name || !type)
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        user_id: user.id,
        name,
        type,
        icon: icon || '💰',
        color: color || '#6B7280',
        is_default: false,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
