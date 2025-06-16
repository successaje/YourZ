'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiUser } from 'react-icons/fi'
import Link from 'next/link'
import { useZora } from '@/hooks/useZora'
import { useIPFS } from '@/utils/ipfs'
import type { Post } from '@/types'

// Type for author information
interface Author {
  address: string;
  name: string;
  avatar?: string;
}

// Extended interface for database post that includes all possible fields
interface DatabasePost extends Omit<Post, 'author' | 'created_at' | 'updated_at'> {
  author_id?: string;
  author_name?: string;
  author_avatar?: string;
  cover_image?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
  is_nft?: boolean;
  token_id?: string;
  contract_address?: string;
  ipfs_hash?: string;
  metadata?: {
    nftMetadata?: {
      tokenId?: string;
      contractAddress?: string;
      price?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

// Helper function to safely access author information
const getAuthorInfo = (post: any, currentAddress?: string | null): Author => {
  // If author is already properly formatted
  if (typeof post.author === 'object' && post.author !== null) {
    return {
      address: post.author.address || '',
      name: post.author.name || 'Anonymous',
      avatar: post.author.avatar
    };
  }
  
  // Fallback to author_id and author_name
  if (post.author_id) {
    return {
      address: post.author_id,
      name: post.author_name || `user_${post.author_id.slice(0, 6)}`,
      avatar: post.author_avatar
    };
  }
  
  // Fallback to connected wallet
  if (currentAddress) {
    return {
      address: currentAddress.toLowerCase(),
      name: `user_${currentAddress.slice(0, 6)}`,
      avatar: undefined
    };
  }
  
  // Default fallback
  return {
    address: 'unknown',
    name: 'Anonymous',
    avatar: undefined
  };
};

interface PostPageParams {
  [key: string]: string
  id: string
}

export default function PostPage() {
  const router = useRouter()
  const params = useParams<PostPageParams>()
  const { address } = useAccount()
  const { collectPost, resellPost } = useZora()
  const { getFromIPFS } = useIPFS()
  
  const [post, setPost] = useState<DatabasePost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCollecting, setIsCollecting] = useState(false)
  const [isReselling, setIsReselling] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.id) {
        toast.error('Post ID is missing')
        router.push('/')
        return
      }
      
      try {
        setIsLoading(true)
        
        // Initialize Supabase client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        // Fetch the post from the database
        const { data: dbPost, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single() as { data: DatabasePost | null, error: any }
          
        if (error) throw error
        
        if (!dbPost) {
          throw new Error('Post not found')
        }
        
        // Process the post data with proper typing
        const postData: DatabasePost = {
          ...dbPost,
          id: dbPost.id,
          title: dbPost.title || 'Untitled',
          content: dbPost.content || '',
          excerpt: dbPost.excerpt || '',
          coverImage: dbPost.cover_image || dbPost.coverImage || null,
          author: getAuthorInfo(dbPost, address),
          author_name: dbPost.author_name || '',
          created_at: dbPost.created_at ? new Date(dbPost.created_at).toISOString() : new Date().toISOString(),
          updated_at: dbPost.updated_at ? new Date(dbPost.updated_at).toISOString() : new Date().toISOString(),
          is_nft: dbPost.is_nft ?? false,
          status: (dbPost.status as 'draft' | 'published' | 'minted') || 'published',
          tags: Array.isArray(dbPost.tags) ? dbPost.tags : [],
          metadata: {
            title: dbPost.title,
            content: dbPost.content,
            ...(typeof dbPost.metadata === 'object' && dbPost.metadata !== null ? dbPost.metadata : {}),
            nftMetadata: dbPost.is_nft && dbPost.metadata?.nftMetadata ? dbPost.metadata.nftMetadata : undefined
          },
          // Include any additional fields that might be needed
          ...(dbPost.price && { price: dbPost.price }),
          ...(dbPost.token_id && { tokenId: dbPost.token_id }),
          ...(dbPost.contract_address && { contractAddress: dbPost.contract_address }),
          ...(dbPost.ipfs_hash && { ipfsHash: dbPost.ipfs_hash })
        }
        
        setPost(postData)
      } catch (error) {
        console.error('Error fetching post:', error)
        toast.error('Failed to load post')
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (params?.id) {
      fetchPost()
    }
  }, [params?.id, router, address])

  const handleCollect = async () => {
    if (!address || !post) {
      toast.error('Please connect your wallet to collect this post')
      return
    }
    
    try {
      setIsCollecting(true)
      
      // Call the collectPost function from useZora hook
      const result = await collectPost(post.id, address)
      
      if (result?.success && result.transactionHash) {
        toast.success('Post collected successfully!')
        // Refresh the page to show updated data
        router.refresh()
      } else {
        throw new Error('Failed to collect post')
      }
    } catch (error) {
      console.error('Error collecting post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to collect post')
    } finally {
      setIsCollecting(false)
    }
  }

  const handleResell = async () => {
    if (!address || !post) {
      toast.error('Please connect your wallet to resell this post')
      return
    }
    
    try {
      setIsReselling(true)
      
      // Call the resellPost function from useZora hook
      const result = await resellPost(post.id, address)
      
      if (result?.success && result.transactionHash) {
        toast.success('Post listed for resale successfully!')
        // Refresh the page to show updated data
        router.refresh()
      } else {
        throw new Error('Failed to list post for resale')
      }
    } catch (error) {
      console.error('Error reselling post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to resell post')
    } finally {
      setIsReselling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded mt-6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Post not found
          </h2>
          <p className="text-gray-600 mb-8">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FiArrowLeft className="mr-2" />
            Back to posts
          </Link>
        </div>
        
        <article className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {(post.coverImage || post.cover_image) && (
            <div className="relative h-64 w-full overflow-hidden rounded-lg mb-8">
              <img
                src={post.coverImage || post.cover_image || ''}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-8">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                {post.author?.avatar ? (
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.name} 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <FiUser className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-medium">{post.author_name || post.author?.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">
                  {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'Recently'}
                </p>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>
            
            <div 
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {post.is_nft && post.metadata?.nftMetadata && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4">NFT Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.metadata.nftMetadata.tokenId && (
                    <div>
                      <p className="text-sm text-gray-500">Token ID</p>
                      <p className="font-mono">{post.metadata.nftMetadata.tokenId}</p>
                    </div>
                  )}
                  {post.metadata.nftMetadata.contractAddress && (
                    <div>
                      <p className="text-sm text-gray-500">Contract Address</p>
                      <p className="font-mono">{post.metadata.nftMetadata.contractAddress}</p>
                    </div>
                  )}
                  {post.metadata.nftMetadata.price && (
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p>{post.metadata.nftMetadata.price} ETH</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleCollect}
                    disabled={isCollecting || !address}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!address ? 'Connect Wallet' : isCollecting ? 'Processing...' : 'Collect NFT'}
                  </button>
                  
                  <button
                    onClick={handleResell}
                    disabled={isReselling || !address}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!address ? 'Connect Wallet' : isReselling ? 'Processing...' : 'Resell'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </motion.div>
  )
}