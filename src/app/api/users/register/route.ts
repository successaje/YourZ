import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { address, username, email, ipfsHash } = await request.json()

    if (!address || !username || !email || !ipfsHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if username is taken
    const { data: existingUser, error: usernameError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (usernameError) {
      throw usernameError
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Check if email is taken
    const { data: existingEmail, error: emailError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (emailError) {
      throw emailError
    }

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const { data: registeredUser, error: addressError } = await supabase
      .from('users')
      .select('id')
      .ilike('address', address.toLowerCase())
      .maybeSingle()

    if (addressError) {
      throw addressError
    }

    if (registeredUser) {
      return NextResponse.json(
        { error: 'User is already registered' },
        { status: 400 }
      )
    }

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        address: address.toLowerCase(),
        username,
        email,
        ipfs_hash: ipfsHash
      }])
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Create initial user stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert([{
        user_id: newUser.id,
        posts_count: 0,
        collections_count: 0,
        nfts_count: 0,
        total_likes: 0
      }])

    if (statsError) {
      throw statsError
    }

    // Get user stats with follower/following counts
    const { data: userStats, error: statsQueryError } = await supabase
      .from('user_stats')
      .select(`
        *,
        followers:user_followers!followed_id(count),
        following:user_followers!follower_id(count)
      `)
      .eq('user_id', newUser.id)
      .maybeSingle()

    if (statsQueryError) {
      throw statsQueryError
    }

    // Return user with stats
    return NextResponse.json({
      ...newUser,
      stats: {
        ...userStats,
        followers_count: userStats?.followers?.[0]?.count || 0,
        following_count: userStats?.following?.[0]?.count || 0
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
} 