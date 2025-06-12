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
    const normalizedAddress = address.toLowerCase()
    console.log('Searching for user with address:', normalizedAddress)

    // First, let's check if the users table has any records
    const { count: totalUsers, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting users:', countError)
    } else {
      console.log('Total users in database:', totalUsers)
    }

    // Let's see what users we have in the database
    const { data: allUsers, error: listError } = await supabase
      .from('users')
      .select('address')
    
    if (listError) {
      console.error('Error listing users:', listError)
    } else {
      console.log('Users in database:', allUsers)
    }

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

    if (profileError) {
      console.error('Profile error:', profileError)
      // If no profile found, return a more specific error
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'User not found',
          details: 'No profile found for this address. Please register first.',
          address: normalizedAddress,
          debug: {
            searchedAddress: normalizedAddress,
            totalUsers,
            availableAddresses: allUsers?.map(u => u.address)
          }
        }, { status: 404 })
      }
      throw profileError
    }

    if (!profile) {
      return NextResponse.json({ 
        error: 'User not found',
        details: 'No profile found for this address. Please register first.',
        address: normalizedAddress,
        debug: {
          searchedAddress: normalizedAddress,
          totalUsers,
          availableAddresses: allUsers?.map(u => u.address)
        }
      }, { status: 404 })
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

    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Stats error:', statsError)
      throw statsError
    }

    const response = {
      ...profile,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      stats: stats || {
        posts_count: 0,
        collections_count: 0,
        nfts_count: 0,
        total_likes: 0
      }
    }

    console.log('Profile API response:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 