import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

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
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const normalizedAddress = address.toLowerCase()
    console.log('Cleaning up data for address:', normalizedAddress)

    // Get user from Supabase to get IPFS hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, ipfs_hash')
      .ilike('address', normalizedAddress)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user:', userError)
      throw userError
    }

    // Delete from Supabase if user exists
    if (user) {
      // Delete user stats
      const { error: statsError } = await supabase
        .from('user_stats')
        .delete()
        .eq('user_id', user.id)

      if (statsError) {
        console.error('Error deleting user stats:', statsError)
        throw statsError
      }

      // Delete user followers
      const { error: followersError } = await supabase
        .from('user_followers')
        .delete()
        .or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`)

      if (followersError) {
        console.error('Error deleting user followers:', followersError)
        throw followersError
      }

      // Delete user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (deleteError) {
        console.error('Error deleting user:', deleteError)
        throw deleteError
      }

      // Delete from Pinata if IPFS hash exists
      if (user.ipfs_hash) {
        try {
          await axios.delete(`https://api.pinata.cloud/pinning/unpin/${user.ipfs_hash}`, {
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
            }
          })
        } catch (pinataError) {
          console.error('Error deleting from Pinata:', pinataError)
          // Don't throw here, as the Supabase cleanup was successful
        }
      }
    }

    return NextResponse.json({
      message: 'User data cleaned up successfully',
      address: normalizedAddress
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ 
      error: 'Failed to clean up user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 