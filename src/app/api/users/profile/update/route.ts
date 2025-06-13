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

export async function PUT(request: Request) {
  try {
    console.log('Starting profile update...')
    const { address, ...updateData } = await request.json()
    console.log('Update request data:', { address, updateData })

    if (!address) {
      console.log('Error: Address is missing')
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // First check if user exists
    console.log('Checking if user exists for address:', address.toLowerCase())
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .ilike('address', address.toLowerCase())
      .single()

    if (checkError) {
      console.error('Error checking user existence:', checkError)
      return NextResponse.json({ 
        error: 'Failed to check user existence',
        details: checkError.message
      }, { status: 500 })
    }

    if (!existingUser) {
      console.log('User not found for address:', address.toLowerCase())
      return NextResponse.json({ 
        error: 'User not found',
        details: 'No profile found for this address. Please register first.'
      }, { status: 404 })
    }

    console.log('Found existing user:', existingUser)

    // Prepare update fields
    const updateFields = {
      username: updateData.username,
      bio: updateData.bio || null,
      social_links: updateData.social_links || {},
      updated_at: new Date().toISOString()
    }

    console.log('Update fields:', updateFields)

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', existingUser.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    if (!updatedProfile) {
      console.error('Profile update succeeded but no profile returned')
      return NextResponse.json(
        { error: 'Profile update succeeded but no profile returned' },
        { status: 500 }
      )
    }

    console.log('Profile updated successfully:', updatedProfile)
    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Unexpected error in profile update API:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 