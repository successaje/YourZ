import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY

export async function POST(request: Request) {
  try {
    const { address, ipfsHash } = await request.json()

    if (!address || !ipfsHash) {
      return NextResponse.json({ error: 'Address and IPFS hash are required' }, { status: 400 })
    }

    const normalizedAddress = address.toLowerCase()
    console.log('Migrating user data for address:', normalizedAddress)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .ilike('address', normalizedAddress)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User already exists',
        details: 'This address is already registered in the database'
      }, { status: 400 })
    }

    // Fetch user data from Pinata
    console.log('Fetching data from Pinata:', `${PINATA_GATEWAY}/ipfs/${ipfsHash}`)
    const pinataResponse = await axios.get(`${PINATA_GATEWAY}/ipfs/${ipfsHash}`)
    const userData = pinataResponse.data
    console.log('Pinata data received:', userData)

    // Create user in Supabase with new structure
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        address: normalizedAddress,
        username: userData.username,
        email: userData.email,
        ipfs_hash: ipfsHash,
        created_at: userData.createdAt,
        bio: '',
        level: 1,
        social_links: {}
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user in Supabase:', createError)
      return NextResponse.json({ error: 'Failed to create user in Supabase' }, { status: 500 })
    }

    console.log('User created in Supabase:', newUser)

    // Create initial user stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert({
        user_id: newUser.id,
        posts_count: 0,
        collections_count: 0,
        nfts_count: 0,
        total_likes: 0
      })

    if (statsError) {
      console.error('Error creating user stats:', statsError)
      return NextResponse.json({ error: 'Failed to create user stats' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'User data migrated successfully',
      user: newUser
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Failed to migrate user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 