import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, icon, color } = body

    const { data, error } = await supabase
      .from('categories')
      .update({ name, icon, color })
      .eq('id', params.id)
      .or(`is_default.eq.true,user_id.eq.${user.id}`)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', params.id)
      .eq('user_id', user.id)

    if (count && count > 0)
      return NextResponse.json(
        { error: `Kategori ini dipakai oleh ${count} transaksi. Hapus transaksi terlebih dahulu.` },
        { status: 400 }
      )

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)   // hanya bisa hapus milik sendiri

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 })
  }
}
