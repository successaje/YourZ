'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { createClient } from '@supabase/supabase-js'
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaShare } from 'react-icons/fa'
import { FiStar, FiUsers, FiTrendingUp, FiExternalLink, FiUser } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { PlaceholderAvatar } from '@/components/PlaceholderAvatar'
import Comments from '@/components/Comments'
import CoinModal from '@/components/CoinModal'
import { useZora } from '@/hooks/useZora'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Post {
  id: string
  title: string
  content: string
  metadata: any
  status: string
  is_nft: boolean
  has_coin?: boolean
  created_at: string
  updated_at: string
  address: string
  author_name?: string
  likes_count?: number
  is_liked?: boolean
  is_bookmarked?: boolean
}

export default function PostPage() {
  const params = useParams()
  const { address } = useAccount()
  const { collectPost, resellPost } = useZora()
  
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserAddress, setCurrentUserAddress] = useState<string | undefined>()
  
  // Coin and NFT states
  const [coinData, setCoinData] = useState<any>(null)
  const [showCoinModal, setShowCoinModal] = useState(false)
  const [isCollecting, setIsCollecting] = useState(false)
  const [isReselling, setIsReselling] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.id) return
      
      try {
        // First, try to get the post with likes and bookmarks
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Transform the data to include likes count and other metadata
        const transformedPost = {
          ...data,
          likes_count: 0, // Default to 0
          is_liked: false,
          is_bookmarked: false
        }

        // Try to get likes count
        try {
          const { count } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', data.id)
          
          if (count !== null) {
            transformedPost.likes_count = count
          }
        } catch (err) {
          console.warn('Could not fetch likes count:', err)
        }

        setPost(transformedPost)
        
        // Fetch coin data if post has a coin
        if (transformedPost.has_coin) {
          try {
            const { data: coin, error: coinError } = await supabase
              .from('post_coins')
              .select('*')
              .eq('post_id', transformedPost.id)
              .single()
            
            if (!coinError && coin) {
              setCoinData(coin)
            }
          } catch (err) {
            console.warn('Could not fetch coin data:', err)
          }
        }
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post')
        toast.error('Failed to load post')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params?.id])

  // Set current user address when wallet is connected
  useEffect(() => {
    setCurrentUserAddress(address)
  }, [address])

  const handleLike = async () => {
    if (!post || !address) return

    try {
      const { error } = await supabase
        .from('post_likes')
        .upsert({
          post_id: post.id,
          user_address: address,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setPost(prev => prev ? {
        ...prev,
        likes_count: (prev.likes_count || 0) + 1,
        is_liked: true
      } : null)

      toast.success('Post liked!')
    } catch (err) {
      console.error('Error liking post:', err)
      toast.error('Failed to like post')
    }
  }

  const handleBookmark = async () => {
    if (!post || !address) return

    try {
      const { error } = await supabase
        .from('post_bookmarks')
        .upsert({
          post_id: post.id,
          user_address: address,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setPost(prev => prev ? {
        ...prev,
        is_bookmarked: true
      } : null)

      toast.success('Post bookmarked!')
    } catch (err) {
      console.error('Error bookmarking post:', err)
      toast.error('Failed to bookmark post')
    }
  }

  const handleShare = () => {
    if (!post) return

    const url = `${window.location.origin}/posts/${post.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

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
        window.location.reload()
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
        window.location.reload()
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Post</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Post not found'}</p>
            <Link href="/" className="text-primary hover:text-primary/90">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Post Header */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <Link href={`/profile?address=${post.address}`} className="flex items-center gap-3">
                <PlaceholderAvatar
                  address={post.address}
                  name={post.author_name}
                  size={40}
                  className="rounded-full"
                />
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {post.author_name || 'Anonymous'}
                  </p>
                  <span className="text-gray-500 dark:text-gray-400">•</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {post.address.slice(0, 6)}...{post.address.slice(-4)}
                  </p>
                  <span className="text-gray-500 dark:text-gray-400">•</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </div>

            {/* Post Content */}
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Coin Information */}
            {coinData && (
              <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🪙</span>
                    </span>
                    {coinData.name} ({coinData.symbol})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCoinModal(true)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <FiTrendingUp className="mr-2" />
                      View Coin Details
                    </button>
                    <Link
                      href={`https://testnet.zora.co/coin/bsep:${coinData.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      <FiExternalLink className="mr-2" />
                      View on Zora
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Contract Address</p>
                    <p className="font-mono text-gray-900 dark:text-white truncate">
                      {coinData.contract_address}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Total Supply</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {coinData.total_supply?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-gray-900 dark:text-white">
                      {coinData.created_at ? new Date(coinData.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This post has an associated coin. Click "View Coin Details" to see trading activities, holders, and market data.
                  </p>
                </div>
              </div>
            )}

            {/* NFT Collection Section */}
            {post.is_nft && post.metadata?.nftMetadata && (
              <div className="mt-8 p-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <FiStar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Collect This Post as NFT</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Become an early supporter and own this content</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiUsers className="w-4 h-4" />
                    <span>Early supporters get exclusive benefits</span>
                  </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiStar className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">Early Access</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get first access to future content and exclusive drops</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiTrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">Value Growth</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Support creators and potentially earn from content success</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiUsers className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">Community</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Join exclusive community of early supporters</p>
                  </div>
                </div>

                {/* NFT Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-purple-100 dark:border-purple-800 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">NFT Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {post.metadata.nftMetadata.tokenId && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Token ID</p>
                        <p className="font-mono text-gray-900 dark:text-white">{post.metadata.nftMetadata.tokenId}</p>
                      </div>
                    )}
                    {post.metadata.nftMetadata.contractAddress && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Contract Address</p>
                        <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                          {post.metadata.nftMetadata.contractAddress}
                        </p>
                      </div>
                    )}
                    {post.metadata.nftMetadata.price && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{post.metadata.nftMetadata.price} ETH</p>
                      </div>
                    )}
                    {post.metadata.nftMetadata.maxSupply && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Supply</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {post.metadata.nftMetadata.currentSupply || 0}/{post.metadata.nftMetadata.maxSupply}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCollect}
                    disabled={isCollecting || !address}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {!address ? (
                      <>
                        <FiUser className="mr-2" />
                        Connect Wallet to Collect
                      </>
                    ) : isCollecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiStar className="mr-2" />
                        Collect NFT - Become Early Supporter
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleResell}
                    disabled={isReselling || !address}
                    className="inline-flex items-center justify-center px-6 py-3 border border-purple-300 text-base font-medium rounded-lg shadow-sm text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {!address ? 'Connect Wallet' : isReselling ? 'Processing...' : 'Resell NFT'}
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By collecting this NFT, you're supporting the creator and becoming part of their journey
                  </p>
                </div>
              </div>
            )}

            {/* Support Creator Section - Show for posts without NFT or coin */}
            {!post.is_nft && !coinData && (
              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiStar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Support This Creator
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Help this creator continue making amazing content by becoming an early supporter
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      className="inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-lg shadow-sm text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <FiUsers className="mr-2" />
                      Follow Creator
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Post Actions */}
            <div className="mt-8 pt-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                >
                  {post.is_liked ? (
                    <FaHeart className="w-5 h-5 text-red-500" />
                  ) : (
                    <FaRegHeart className="w-5 h-5" />
                  )}
                  <span>{post.likes_count || 0}</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className="flex items-center gap-2 text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
                >
                  {post.is_bookmarked ? (
                    <FaBookmark className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <FaRegBookmark className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors"
                >
                  <FaShare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <Comments postId={post.id} currentUserAddress={currentUserAddress} />
      </div>

      {/* Coin View Modal */}
      <CoinModal
        isOpen={showCoinModal}
        onClose={() => setShowCoinModal(false)}
        coin={coinData}
      />
      
      <Toaster position="bottom-right" />
    </div>
  )
} 