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

export async function POST(request: Request) {
  try {
    const { followerAddress, followedAddress } = await request.json()

    if (!followerAddress || !followedAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user IDs from addresses
    const { data: follower, error: followerError } = await supabase
      .from('users')
      .select('id')
      .eq('address', followerAddress.toLowerCase())
      .single()

    const { data: followed, error: followedError } = await supabase
      .from('users')
      .select('id')
      .eq('address', followedAddress.toLowerCase())
      .single()

    if (followerError || followedError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('user_followers')
      .select('*')
      .eq('follower_id', follower.id)
      .eq('followed_id', followed.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw checkError
    }

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this user' }, { status: 400 })
    }

    // Create follow relationship
    const { data: follow, error: followError } = await supabase
      .from('user_followers')
      .insert([
        {
          follower_id: follower.id,
          followed_id: followed.id,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (followError) {
      throw followError
    }

    return NextResponse.json(follow)
  } catch (error) {
    console.error('Error following user:', error)
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 })
  }
} 