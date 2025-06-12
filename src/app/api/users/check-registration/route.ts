import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('address')
      .eq('address', address)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ isRegistered: !!data })
  } catch (error) {
    console.error('Error checking user registration:', error)
    return NextResponse.json({ error: 'Failed to check user registration' }, { status: 500 })
  }
} 