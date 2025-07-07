'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { toast } from 'react-hot-toast'
import PostEditor from '@/components/PostEditor'
import { motion } from 'framer-motion'
import { uploadToIPFS, uploadFileToIPFS } from '@/lib/ipfs'
import { supabase } from '@/lib/supabase'
import { baseSepolia } from 'viem/chains'
import { parseEther } from 'viem'
import { create1155 } from '@zoralabs/protocol-sdk'

// Standalone function for NFT creation following Zora docs
async function createNFTDirectly({
  postId,
  postTitle,
  postContent,
  postImage,
  price,
  maxSupply,
  description,
  walletClient,
  publicClient,
  account,
}: {
  postId: string
  postTitle: string
  postContent: string
  postImage: string
  price: number
  maxSupply: number
  description: string
  walletClient: any
  publicClient: any
  account: string
}) {
  console.log('🚀 createNFTDirectly function called!')
  try {
    console.log(`Creating 1155 NFT contract for post: ${postTitle}`)
    console.log('Function parameters received:', {
      postId,
      postTitle,
      walletClient: walletClient ? 'present' : 'undefined',
      publicClient: publicClient ? 'present' : 'undefined',
      account,
      walletClientType: typeof walletClient,
      publicClientType: typeof publicClient
    })
    
    // Validate required parameters
    console.log('About to validate walletClient:', walletClient)
    if (!walletClient) {
      console.error('Wallet client validation failed - walletClient is falsy')
      throw new Error('Wallet client is required but not provided')
    }
    console.log('Wallet client validation passed')
    
    console.log('About to validate publicClient:', publicClient)
    if (!publicClient) {
      console.error('Public client validation failed - publicClient is falsy')
      throw new Error('Public client is required but not provided')
    }
    console.log('Public client validation passed')
    
    console.log('About to validate account:', account)
    if (!account) {
      console.error('Account validation failed - account is falsy')
      throw new Error('Account address is required but not provided')
    }
    console.log('Account validation passed')
    
    console.log('Validated clients:', { 
      hasWalletClient: !!walletClient, 
      hasPublicClient: !!publicClient, 
      account: account 
    })
    
    // Import the Zora deployment functions
    const { deployZora1155Contract } = await import('@/utils/zora1155-simple')
    
    // Import existing IPFS functions
    const { uploadToIPFS, uploadFileToIPFS } = await import('@/lib/ipfs')
    
    // Upload image to IPFS
    let imageUri: string
    if (postImage.startsWith('ipfs://')) {
      imageUri = postImage
    } else {
      const imageHash = await uploadFileToIPFS(postImage as any)
      imageUri = `ipfs://${imageHash}`
    }
    
    // Create token metadata
    const tokenMetadata = {
      name: postTitle,
      description: description || `NFT for post: ${postTitle} on YourZ`,
      image: imageUri,
      external_url: typeof window !== 'undefined' ? `${window.location.origin}/post/${postId}` : '',
      attributes: [
        { trait_type: "Content Type", value: "Blog Post" },
        { trait_type: "Platform", value: "YourZ" },
        { trait_type: "Max Supply", value: maxSupply },
        { trait_type: "Token ID", value: "1" }
      ]
    }
    
    // Upload token metadata to IPFS
    const tokenMetadataHash = await uploadToIPFS(tokenMetadata)
    const tokenMetadataUri = `ipfs://${tokenMetadataHash}`
    
    // Create contract metadata
    const contractMetadata = {
      name: `${postTitle} NFT Collection`,
      description: `NFT collection for post: ${postTitle}`,
      image: imageUri,
      external_url: typeof window !== 'undefined' ? `${window.location.origin}/post/${postId}` : '',
    }
    
    // Upload contract metadata to IPFS
    const contractMetadataHash = await uploadToIPFS(contractMetadata)
    const contractMetadataUri = `ipfs://${contractMetadataHash}`
    
    console.log('Metadata uploaded to IPFS:', {
      tokenMetadataUri,
      contractMetadataUri
    })
    
    // Create 1155 contract and token using Zora SDK with create1155 for proper minting support
    const { parameters, contractAddress, prepareMint } = await create1155({
      contract: {
        name: `${postTitle} NFT Collection`,
        uri: contractMetadataUri,
      },
      token: {
        tokenMetadataURI: tokenMetadataUri,
        // Add sales configuration to enable minting
        salesConfig: {
          publicSalePrice: price ? parseEther(price.toString()) : 0n,
          maxSalePurchasePerAddress: maxSupply,
          publicSaleStart: 0n, // Start immediately
          publicSaleEnd: 0n, // No end date
          presaleStart: 0n,
          presaleEnd: 0n,
          presaleMerkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
      },
      account: account as `0x${string}`,
      publicClient,
    })
    
    console.log('Contract creation parameters prepared:', { contractAddress, parameters })
    
    // Debug: Check walletClient before writeContract
    console.log('About to call writeContract. walletClient:', walletClient)
    console.log('walletClient type:', typeof walletClient)
    console.log('walletClient has writeContract:', walletClient && typeof walletClient.writeContract === 'function')
    
    // Execute the contract creation transaction
    const hash = await walletClient.writeContract(parameters)
    console.log('Contract creation transaction sent with hash:', hash)
    
    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    if (receipt.status !== 'success') {
      throw new Error('Contract creation failed')
    }
    
    console.log('1155 contract created successfully at:', contractAddress)
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      tokenId: '1', // First token in the collection
      contractAddress: contractAddress,
      metadataUri: tokenMetadataUri,
      prepareMint: true, // Indicate that minting is available
    }
  } catch (error) {
    console.error('Error creating NFT directly:', error)
    throw error
  }
}

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

      // Now attempt NFT creation (AFTER post is saved)
      if (metadata.nftMetadata) {
        try {
          console.log('🖼️ Starting NFT creation...')
          console.log('Debug: NFT metadata:', metadata.nftMetadata)
          
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

          // Prepare NFT metadata for IPFS
          let nftImageUri: string
          
          if (metadata.nftMetadata?.coverImage) {
            const imageHash = await uploadFileToIPFS(metadata.nftMetadata.coverImage)
            nftImageUri = `ipfs://${imageHash}`
          } else if (metadata.coverImage && metadata.coverImage.startsWith('ipfs://')) {
            nftImageUri = metadata.coverImage
          } else {
            nftImageUri = 'ipfs://bafybeihj5z3b2g4d4q4z4y5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q'
          }
          
          const nftMetadata: any = {
            name: post.title,
            description: metadata.nftMetadata.description || `NFT for post: ${post.title} on YourZ`,
            external_url: typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '',
            image: nftImageUri,
            attributes: [
              {
                trait_type: "Content Type",
                value: "Blog Post"
              },
              {
                trait_type: "Platform",
                value: "YourZ"
              },
              {
                trait_type: "Max Supply",
                value: metadata.nftMetadata.supply || 1
              },
              {
                trait_type: "Token ID",
                value: "1"
              }
            ],
            collection: {
              name: `${post.title} NFT Collection`,
              description: `NFT collection for post: ${post.title}`
            }
          }
          
          const metadataUri = await uploadToIPFS(nftMetadata)
          console.log('✅ NFT metadata uploaded to IPFS:', metadataUri)

          console.log('Debug: About to call createNFTDirectly with params:', {
            postId: post.id,
            postTitle: post.title,
            postImage: nftImageUri,
            price: parseFloat(metadata.nftMetadata.price),
            maxSupply: metadata.nftMetadata.supply || 1,
            description: metadata.nftMetadata.description,
          })
          
          // Validate wallet clients before proceeding
          if (!walletClient) {
            throw new Error('Wallet client is not available. Please ensure your wallet is connected.')
          }
          if (!publicClient) {
            throw new Error('Public client is not available. Please ensure your wallet is connected.')
          }
          
          console.log('Wallet clients validated:', { 
            hasWalletClient: !!walletClient, 
            hasPublicClient: !!publicClient,
            walletClientType: typeof walletClient,
            publicClientType: typeof publicClient
          })
          
          // Create NFT using our standalone function
          const nftResult = await createNFTDirectly({
            postId: post.id,
            postTitle: post.title,
            postContent: content,
            postImage: nftImageUri,
            price: parseFloat(metadata.nftMetadata.price),
            maxSupply: metadata.nftMetadata.supply || 1,
            description: metadata.nftMetadata.description,
            walletClient,
            publicClient,
            account: address,
          })

          console.log('✅ 1155 NFT contract created successfully:', nftResult)
          console.log('💾 Saving NFT collection to database...')
          
          // Check authentication status
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
          console.log('Auth status:', { 
            authUser: authUser ? 'authenticated' : 'not authenticated',
            authError,
            address: address.toLowerCase()
          })
          
          // Save NFT to post_nfts table
          const { error: nftError } = await supabase
            .from('post_nfts')
            .insert({
              post_id: post.id,
              contract_address: nftResult.contractAddress,
              token_id: nftResult.tokenId,
              name: nftMetadata.name,
              description: nftMetadata.description,
              image_uri: nftImageUri,
              metadata_uri: metadataUri, // Use the actual metadata URI from IPFS
              price: metadata.nftMetadata.price,
              max_supply: metadata.nftMetadata.supply || 1,
              current_supply: 0, // No mints yet, contract is just deployed
              creator_id: address.toLowerCase(), // Use wallet address instead of UUID
              creator_address: address.toLowerCase(), // Add the wallet address
              status: 'minted', // Changed from 'active' to 'minted' to match enum
              minted_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .single()

          if (nftError) {
            console.error('❌ Error saving NFT to database:', nftError)
            throw new Error(`Failed to save NFT: ${nftError.message}`)
          }

          console.log('✅ NFT saved to database successfully')
          toast.success('1155 NFT Contract created successfully!')

        } catch (error) {
          console.error('❌ Error in NFT creation:', error)
          toast.error('Post saved, but failed to create NFT')
          // Don't throw - post was already saved successfully
        }
      }

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

          // Validate wallet clients before proceeding
          if (!walletClient) {
            throw new Error('Wallet client is not available. Please ensure your wallet is connected.')
          }
          if (!publicClient) {
            throw new Error('Public client is not available. Please ensure your wallet is connected.')
          }

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
          console.log('💾 Saving coin to database with creator_id:', address.toLowerCase())
          
          // Save coin to post_coins table
          const { error: coinError } = await supabase
            .from('post_coins')
            .insert({
              post_id: post.id,
              contract_address: coinContractAddress,
              name: coinMetadata.name,
              symbol: metadata.coinMetadata.symbol,
              total_supply: 1000000,
              creator_id: address.toLowerCase(), // Use wallet address as text
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