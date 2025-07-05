import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Initialize Supabase client with service role
const supabase = createServerSupabaseClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    console.log('Checking registration for address:', address)
    
    // Test the Supabase connection first
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('Supabase connection test failed:', testError)
      throw new Error(`Supabase connection failed: ${testError.message}`)
    }
    
    console.log('Supabase connection test successful')
    
    // If test passed, proceed with the actual query
    const { data, error } = await supabase
      .from('users')
      .select('address')
      .eq('address', address.toLowerCase())
      .single()

    // PGRST116 means no rows found, which is expected for new users
    if (error && error.code !== 'PGRST116') {
      console.error('Unexpected error checking user registration:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    console.log('User registration check completed successfully')
    return NextResponse.json({ 
      isRegistered: !!data,
      debug: { foundUser: !!data }
    })
  } catch (error: any) {
    console.error('Error checking user registration:', {
      message: error.message,
      details: error.details || error.toString(),
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json({ 
      error: 'Failed to check user registration',
      debug: { 
        message: error.message,
        code: error.code
      } 
    }, { status: 500 })
  }
} 