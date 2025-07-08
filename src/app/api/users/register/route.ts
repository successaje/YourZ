import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    console.log('API: Registration request received')
    const supabase = createServerSupabaseClient()
    const { address, username, email, ipfsHash } = await request.json()
    
    console.log('API: Request data:', { address, username, email: email ? 'provided' : 'not provided', ipfsHash })

    if (!address || !username || !ipfsHash) {
      console.log('API: Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if username is taken
    console.log('API: Checking if username is taken...')
    const { data: existingUser, error: usernameError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (usernameError) {
      console.error('API: Username check error:', usernameError)
      throw usernameError
    }

    if (existingUser) {
      console.log('API: Username already taken')
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Check if email is taken (only if email is provided)
    if (email) {
      console.log('API: Checking if email is taken...')
      const { data: existingEmail, error: emailError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (emailError) {
        console.error('API: Email check error:', emailError)
        throw emailError
      }

      if (existingEmail) {
        console.log('API: Email already registered')
        return NextResponse.json(
          { error: 'Email is already registered' },
          { status: 400 }
        )
      }
    }

    // Check if user is already registered
    console.log('API: Checking if user is already registered...')
    const { data: registeredUser, error: addressError } = await supabase
      .from('users')
      .select('id')
      .ilike('address', address.toLowerCase())
      .maybeSingle()

    if (addressError) {
      console.error('API: Address check error:', addressError)
      throw addressError
    }

    if (registeredUser) {
      console.log('API: User already registered')
      return NextResponse.json(
        { error: 'User is already registered' },
        { status: 400 }
      )
    }

    // Create user
    console.log('API: Creating user...')
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        address: address.toLowerCase(),
        username,
        email: email || null,
        ipfs_hash: ipfsHash
      }])
      .select()
      .single()

    if (createError) {
      console.error('API: User creation error:', createError)
      throw createError
    }

    console.log('API: User created successfully:', newUser.id)

    // Create initial user stats - only include columns that exist in the schema
    console.log('API: Creating user stats...')
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert([{
        address: address.toLowerCase(),
        posts_count: 0,
        collections_count: 0,
        nfts_count: 0,
        total_likes: 0
      }])

    if (statsError) {
      console.error('API: Stats creation error:', statsError)
      // Don't throw error here, just log it since user was created successfully
      console.log('API: Stats creation failed, but user was created successfully')
    } else {
      console.log('API: User stats created successfully')
    }

    // Get user stats if they exist
    const { data: userStats, error: statsQueryError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('address', address.toLowerCase())
      .maybeSingle()

    if (statsQueryError) {
      console.error('API: Stats query error:', statsQueryError)
      // Don't throw error here, just log it
    }

    console.log('API: Registration completed successfully')
    // Return user with stats (if they exist)
    return NextResponse.json({
      ...newUser,
      user_stats: userStats ? [userStats] : []
    })
  } catch (error) {
    console.error('API: Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
} 