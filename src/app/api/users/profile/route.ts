import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    console.log('Fetching profile for address:', address)

    // Get user data with stats and posts (case-insensitive search)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_stats!user_stats_address_fkey (
          id,
          posts_count,
          collections_count,
          nfts_count,
          total_likes
        ),
        posts:posts!posts_address_fkey (
          id,
          title,
          content,
          metadata,
          status,
          is_nft,
          created_at,
          updated_at
        )
      `)
      .ilike('address', address)
      .single()

    console.log('User fetch result:', { user, userError })

    if (userError) {
      if (userError.code === 'PGRST116') {
        // User doesn't exist, create one with minimal data
        console.log('Creating new user...')
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert({
            address: address.toLowerCase(), // Store address in lowercase
            username: `user_${address.slice(0, 6)}`, // Generate a temporary username
            ipfs_hash: '', // Required field
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createUserError) {
          console.error('Error creating user:', createUserError)
          return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
          )
        }

        // Create user stats
        const { error: statsError } = await supabase
          .from('user_stats')
          .insert({
            id: newUser.id,
            address: newUser.address,
            posts_count: 0,
            collections_count: 0,
            nfts_count: 0,
            total_likes: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (statsError) {
          console.error('Error creating user stats:', statsError)
          return NextResponse.json(
            { error: 'Failed to create user stats' },
            { status: 500 }
          )
        }

        // Return the new user without username and email
        return NextResponse.json({
          ...newUser,
          user_stats: {
            posts_count: 0,
            collections_count: 0,
            nfts_count: 0,
            total_likes: 0
          },
          posts: []
        })
      }

      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      )
    }

    // If user exists but no stats, create stats
    if (!user.user_stats) {
      const { error: statsError } = await supabase
        .from('user_stats')
        .insert({
          id: user.id,
          address: user.address,
          posts_count: user.posts?.length || 0,
          collections_count: 0,
          nfts_count: 0,
          total_likes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (statsError) {
        console.error('Error creating user stats:', statsError)
      } else {
        // Fetch updated user data with stats
        const { data: updatedUser } = await supabase
          .from('users')
          .select(`
            *,
            user_stats!user_stats_address_fkey (
              id,
              posts_count,
              collections_count,
              nfts_count,
              total_likes
            ),
            posts:posts!posts_address_fkey (
              id,
              title,
              content,
              metadata,
              status,
              is_nft,
              created_at,
              updated_at
            )
          `)
          .eq('id', user.id)
          .single()

        if (updatedUser) {
          return NextResponse.json(updatedUser)
        }
      }
    }

    // Update the posts_count in user_stats to match the actual number of posts
    if (user.user_stats && user.posts) {
      const actualPostCount = user.posts.length
      if (user.user_stats.posts_count !== actualPostCount) {
        const { error: updateError } = await supabase
          .from('user_stats')
          .update({ posts_count: actualPostCount })
          .eq('id', user.user_stats.id)

        if (!updateError) {
          user.user_stats.posts_count = actualPostCount
        }
      }
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 