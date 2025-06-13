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
    const normalizedAddress = address.toLowerCase()
    console.log('Searching for user with address:', normalizedAddress)

    // Get user profile with case-insensitive comparison
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        address,
        username,
        ipfs_hash,
        created_at,
        bio,
        level,
        social_links
      `)
      .ilike('address', normalizedAddress)
      .single()

    // Handle no user found case
    if (profileError?.code === 'PGRST116' || !profile) {
      return NextResponse.json({ 
        error: 'User not found',
        details: 'No profile found for this address. Please register first.',
        address: normalizedAddress
      }, { status: 404 })
    }

    // Handle other errors
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw profileError
    }

    // Get followers count
    const { count: followersCount } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact', head: true })
      .eq('followed_id', profile.id)

    // Get following count
    const { count: followingCount } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id)

    // Get user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('posts_count, collections_count, nfts_count, total_likes')
      .eq('user_id', profile.id)
      .single()

    // Handle no stats found case
    if (statsError?.code === 'PGRST116') {
      // Use default stats
      return NextResponse.json({
        ...profile,
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        stats: {
          posts_count: 0,
          collections_count: 0,
          nfts_count: 0,
          total_likes: 0
        }
      })
    }

    // Handle other stats errors
    if (statsError) {
      console.error('Error fetching stats:', statsError)
      throw statsError
    }

    return NextResponse.json({
      ...profile,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      stats: stats || {
        posts_count: 0,
        collections_count: 0,
        nfts_count: 0,
        total_likes: 0
      }
    })
  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 