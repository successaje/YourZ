import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
)

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
      .eq('address', address.toLowerCase())
      .single()

    // PGRST116 means no rows found, which is expected for new users
    if (error && error.code !== 'PGRST116') {
      console.error('Unexpected error checking user registration:', error)
      throw error
    }

    // If no error or PGRST116 error, user is not registered
    return NextResponse.json({ isRegistered: !!data })
  } catch (error) {
    console.error('Error checking user registration:', error)
    return NextResponse.json({ error: 'Failed to check user registration' }, { status: 500 })
  }
} 