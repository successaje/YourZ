'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import PostEditor from '@/components/PostEditor'
import { useUserProfile } from '@/hooks/useUserProfile'
import { toast } from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'

export default function WritePage() {
  const router = useRouter()
  const { address } = useAccount()
  const { profile, isLoading: isLoadingProfile } = useUserProfile(address)
  const [wordCount, setWordCount] = useState(0)
  const [showNFTForm, setShowNFTForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (content: string, metadata: any) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setIsSaving(true)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', address)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        throw new Error('Failed to fetch user profile')
      }

      if (!profile) {
        throw new Error('User profile not found')
      }

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([
          {
            content,
            metadata,
            author_id: profile.id,
            author_name: profile.name || 'Anonymous',
            author_avatar: profile.avatar_url,
            wallet_address: address,
            status: 'published'
          }
        ])
        .select()
        .single()

      if (postError) {
        console.error('Error creating post:', postError)
        throw new Error('Failed to create post')
      }

      toast.success('Post published successfully!')
      router.push(`/post/${post.id}`)
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to publish post')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-end mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNFTForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Publish
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNFTForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Publish as NFT
            </motion.button>
          </div>
        </div>

        <PostEditor
          onSave={handleSave}
          onWordCountChange={setWordCount}
          showNFTForm={showNFTForm}
        />
      </div>
    </div>
  )
} 