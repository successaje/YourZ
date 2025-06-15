import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { userId, type, action } = await request.json()

    if (!userId || !type || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (statsError) {
      console.error('Error fetching stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch user stats' },
        { status: 500 }
      )
    }

    // Calculate new values
    const updates: Record<string, number> = {}
    switch (type) {
      case 'post':
        updates.posts_count = stats.posts_count + (action === 'increment' ? 1 : -1)
        break
      case 'collection':
        updates.collections_count = stats.collections_count + (action === 'increment' ? 1 : -1)
        break
      case 'nft':
        updates.nfts_count = stats.nfts_count + (action === 'increment' ? 1 : -1)
        break
      case 'like':
        updates.total_likes = stats.total_likes + (action === 'increment' ? 1 : -1)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid stat type' },
          { status: 400 }
        )
    }

    // Update stats
    const { data: updatedStats, error: updateError } = await supabase
      .from('user_stats')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating stats:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user stats' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedStats)
  } catch (error) {
    console.error('Error in stats update API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 