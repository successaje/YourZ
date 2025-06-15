'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import PostEditor from '@/components/PostEditor'
import { motion } from 'framer-motion'

export default function WritePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [showNFTForm, setShowNFTForm] = useState(false)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  const handleSave = async (content: string, metadata: any) => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    console.log('Starting handleSave with:', { content, metadata, address, showNFTForm })
    setIsLoading(true)

    try {
      // Create Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // First, get or create user profile
      console.log('Fetching user profile for address:', address)
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .ilike('address', address)
        .single()

      console.log('Profile fetch response:', { profile, profileError })

      let userId = profile?.id

      if (!profile) {
        console.log('Profile not found, creating new profile...')
        // Create new user profile
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert({
            address: address.toLowerCase(),
            username: `user_${address.slice(0, 6)}`,
            ipfs_hash: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createUserError) {
          console.error('Error creating user:', createUserError)
          throw new Error(`Failed to create user profile: ${createUserError.message}`)
        }

        if (!newUser) {
          throw new Error('Failed to create user profile: No user data returned')
        }

        userId = newUser.id

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
          throw new Error(`Failed to create user stats: ${statsError.message}`)
        }
      }

      if (!userId) {
        throw new Error('No user ID available for post creation')
      }

      // Create the post
      console.log('Creating post with data:', {
        title: metadata.title,
        content: content,
        metadata: metadata,
        author_id: userId,
        author_name: profile?.username || `user_${address.slice(0, 6)}`,
        address: address.toLowerCase(),
        status: 'published',
        is_nft: showNFTForm,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: metadata.title,
          content: content,
          metadata: metadata,
          author_id: userId,
          author_name: profile?.username || `user_${address.slice(0, 6)}`,
          address: address.toLowerCase(),
          status: 'published',
          is_nft: showNFTForm,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (postError) {
        console.error('Error creating post:', postError)
        throw new Error(`Failed to create post: ${postError.message}`)
      }

      if (!post) {
        throw new Error('Post was not created successfully')
      }

      // Update user stats
      const { error: updateStatsError } = await supabase
        .from('user_stats')
        .update({ 
          posts_count: supabase.rpc('increment', { x: 1 }),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateStatsError) {
        console.error('Error updating user stats:', updateStatsError)
        // Don't throw here, as the post was created successfully
      }

      toast.success('Post published successfully!')
      router.push(`/post/${post.id}`)
    } catch (error) {
      console.error('Error in handleSave:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to publish post')
      throw error // Re-throw to let PostEditor know about the error
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <PostEditor 
            onSave={handleSave}
            isLoading={isLoading}
            showNFTForm={showNFTForm}
            setShowNFTForm={setShowNFTForm}
          />
        </div>
      </div>
    </motion.div>
  )
} 