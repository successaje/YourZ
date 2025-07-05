'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { toast } from 'react-hot-toast'
import PostEditor from '@/components/PostEditor'
import { motion } from 'framer-motion'
import { uploadToIPFS, uploadFileToIPFS } from '@/lib/ipfs'
import { supabase } from '@/lib/supabase'

export default function WritePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [isLoading, setIsLoading] = useState(false)

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

    console.log('Starting handleSave with:', { 
      content: content ? `${content.substring(0, 50)}...` : 'empty',
      metadata: {
        ...metadata,
        content: metadata.content ? '[...content]' : 'no content',
        nftMetadata: metadata.nftMetadata ? '[...nftMetadata]' : 'no nftMetadata',
        coinMetadata: metadata.coinMetadata ? '[...coinMetadata]' : 'no coinMetadata'
      },
      address: address || 'no address',
      isNft: !!metadata.nftMetadata,
      hasCoin: !!metadata.coinMetadata
    })
    setIsLoading(true)

    try {
      // Show network switching notification if coin creation is needed
      if (metadata.coinMetadata) {
        toast('Switching to Base Sepolia network...', {
          duration: 3000,
          icon: '🔄',
          style: {
            background: '#3B82F6',
            color: '#fff',
          },
        });
      }

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

      // Create post FIRST
      const postData = {
        title: metadata.title,
        content: content,
        author_id: userId,
        ipfs_hash: metadata.coverImage || null,
        is_nft: !!metadata.nftMetadata,
        has_coin: !!metadata.coinMetadata,
        nft_contract_address: metadata.nftMetadata?.contractAddress || null,
        mint_price: metadata.nftMetadata?.price ? parseFloat(metadata.nftMetadata.price) : null,
        royalty_bps: metadata.nftMetadata?.royaltyBps ? parseInt(metadata.nftMetadata.royaltyBps) : null,
        author_name: profile?.username || `user_${address.slice(0, 6)}`,
        address: address.toLowerCase(),
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Creating post with data:', postData)

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (postError) {
        console.error('Error creating post:', postError)
        throw new Error(`Failed to create post: ${postError.message}`)
      }

      if (!post) {
        throw new Error('Post was not created successfully')
      }

      // SUCCESS: Post is now saved to Supabase
      console.log('✅ Post successfully saved to Supabase with ID:', post.id)

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

      // Show success message for post creation
      toast.success('Post published successfully!')

      // Now attempt coin deployment (AFTER post is saved)
      if (metadata.coinMetadata) {
        try {
          console.log('🪙 Starting coin deployment...')
          
          // First, verify the user exists in the database
          const { data: userCheck, error: userCheckError } = await supabase
            .from('users')
            .select('id, address')
            .eq('id', userId)
            .single()

          if (userCheckError || !userCheck) {
            throw new Error(`User not found in database: ${userId}`)
          }

          console.log('✅ User verified in database:', userCheck)

          // Prepare coin metadata for IPFS
          let coinImageUri: string
          
          if (metadata.coinMetadata?.image) {
            const imageHash = await uploadFileToIPFS(metadata.coinMetadata.image)
            coinImageUri = `ipfs://${imageHash}`
          } else if (metadata.coverImage && metadata.coverImage.startsWith('ipfs://')) {
            coinImageUri = metadata.coverImage
          } else {
            coinImageUri = 'ipfs://bafybeihj5z3b2g4d4q4z4y5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q'
          }
          
          const coinMetadata: any = {
            name: `${post.title} Coin`,
            description: `Coin for post: ${post.title} on YourZ`,
            external_url: typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '',
            image: coinImageUri,
          }
          
          const metadataUri = await uploadToIPFS(coinMetadata)
          console.log('✅ Coin metadata uploaded to IPFS:', metadataUri)

          // Deploy the coin
          const { deployZoraCoin } = await import('@/utils/zora')
          const coinContractAddress = await deployZoraCoin({
            name: coinMetadata.name,
            symbol: metadata.coinMetadata.symbol,
            uri: `ipfs://${metadataUri}`,
            payoutRecipient: address,
            platformReferrer: '0x0000000000000000000000000000000000000000',
            chainId: 84532,
            currency: 2,
            mintFee: metadata.coinMetadata.mintFee || '0.000777',
            mintFeeRecipient: address,
            walletClient,
            publicClient,
            account: address,
          })

          console.log('✅ Coin deployed successfully:', coinContractAddress)
          console.log('💾 Saving coin to database with creator_id:', address)
          
          // Save coin to post_coins table
          const { error: coinError } = await supabase
            .from('post_coins')
            .insert({
              post_id: post.id,
              contract_address: coinContractAddress,
              name: coinMetadata.name,
              symbol: metadata.coinMetadata.symbol,
              total_supply: 1000000,
              creator_id: address.toLowerCase(), // Use wallet address instead of UUID
              metadata_uri: metadataUri,
              created_at: new Date().toISOString(),
            })
            .single()

          if (coinError) {
            console.error('❌ Error saving coin to database:', coinError)
            throw new Error(`Failed to save coin: ${coinError.message}`)
          }

          console.log('✅ Coin saved to database successfully')
          toast.success('Coin created successfully!')

        } catch (error) {
          console.error('❌ Error in coin deployment:', error)
          toast.error('Post saved, but failed to create coin')
          // Don't throw - post was already saved successfully
        }
      }

      // Navigate to the post page
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
          />
        </div>
      </div>
    </motion.div>
  )
} 