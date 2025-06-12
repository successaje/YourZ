import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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
      .eq('address', followerAddress)
      .single()

    const { data: followed, error: followedError } = await supabase
      .from('users')
      .select('id')
      .eq('address', followedAddress)
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
      // Unfollow
      const { error: unfollowError } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', follower.id)
        .eq('followed_id', followed.id)

      if (unfollowError) throw unfollowError

      return NextResponse.json({ action: 'unfollowed' })
    } else {
      // Follow
      const { error: followError } = await supabase
        .from('user_followers')
        .insert([
          {
            follower_id: follower.id,
            followed_id: followed.id,
            created_at: new Date().toISOString()
          }
        ])

      if (followError) throw followError

      return NextResponse.json({ action: 'followed' })
    }
  } catch (error) {
    console.error('Error in follow/unfollow:', error)
    return NextResponse.json({ error: 'Failed to process follow/unfollow' }, { status: 500 })
  }
} 