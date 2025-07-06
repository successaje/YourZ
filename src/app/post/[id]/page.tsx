'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiUser, FiPlus, FiX, FiExternalLink, FiStar, FiUsers, FiTrendingUp } from 'react-icons/fi'
import Link from 'next/link'
import { useZora } from '@/hooks/useZora'
import { useNFTMinting } from '@/hooks/useNFTMinting'
import { getFromIPFS } from '@/lib/ipfs'
import type { Post } from '@/types'
import { Dialog } from '@headlessui/react'
import { supabase } from '@/lib/supabase'
import CoinModal from '@/components/CoinModal'
import { NetworkSwitcher } from '@/components/NetworkSwitcher'
import { baseSepoliaConfig } from '@/lib/networks'

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
  const { mintNFT, getNFTData, isMinting } = useNFTMinting()
  const chainId = useChainId()
  
  const [post, setPost] = useState<DatabasePost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCollecting, setIsCollecting] = useState(false)
  const [isReselling, setIsReselling] = useState(false)
  const [nftData, setNftData] = useState<any>(null)
  // Modal state
  const [showCoinModal, setShowCoinModal] = useState(false)
  const [showCoinViewModal, setShowCoinViewModal] = useState(false)
  // Coin config state
  const [coinName, setCoinName] = useState('')
  const [coinSymbol, setCoinSymbol] = useState('')
  const [coinSupply, setCoinSupply] = useState(1000)
  const [coinRoyalty, setCoinRoyalty] = useState(5)
  const [coinDesc, setCoinDesc] = useState('')
  // Coin data state
  const [coinData, setCoinData] = useState<any>(null)

  // Eligibility: must be author, logged in, and no coin yet
  const isAuthor = address && post && address.toLowerCase() === post.author?.address?.toLowerCase()
  // For now, assume post.hasCoin or post.coinAddress means coin exists
  const hasCoin = post && (post.hasCoin || post.coinAddress)
  const canCreateCoin = isAuthor && !hasCoin

  // Set default coin name/symbol when modal opens
  useEffect(() => {
    if (showCoinModal && post) {
      setCoinName(`${post.title} Coin`)
      setCoinSymbol(
        post.title
          ? post.title.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() + Math.floor(Math.random() * 90 + 10)
          : 'POST'
      )
    }
  }, [showCoinModal, post])

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.id) {
        toast.error('Post ID is missing')
        router.push('/')
        return
      }
      
      try {
        setIsLoading(true)
        

        
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

        // Fetch coin data if post has a coin
        if (dbPost.has_coin) {
          const { data: coin, error: coinError } = await supabase
            .from('post_coins')
            .select('*')
            .eq('post_id', params.id)
            .single()
          
          if (!coinError && coin) {
            setCoinData(coin)
          }
        }

        // Fetch NFT data if post is an NFT
        if (dbPost.is_nft) {
          const { data: nft, error: nftError } = await supabase
            .from('post_nfts')
            .select('*')
            .eq('post_id', params.id)
            .single()
          
          if (!nftError && nft) {
            setNftData(nft)
          }
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
    if (!address || !post || !nftData) {
      toast.error('Please connect your wallet to mint this NFT')
      return
    }
    
    try {
      setIsCollecting(true)
      
      // Use the new minting functionality
      const result = await mintNFT({
        contractAddress: nftData.contract_address,
        tokenId: nftData.token_id,
        price: nftData.price?.toString() || '0',
        maxSupply: nftData.max_supply,
        currentSupply: nftData.current_supply,
        postTitle: post.title,
        postId: post.id
      })

      console.log('Mint result:', result)
      
      if (result.success) {
        if (result.transactionHash === 'redirected-to-zora') {
          toast.success('Redirected to Zora! Complete your purchase there.')
        } else {
          toast.success('NFT minted successfully!')
          // Refresh the page to show updated data
          router.refresh()
        }
      } else {
        throw new Error(result.error || 'Failed to mint NFT')
      }
    } catch (error) {
      console.error('Error minting NFT:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to mint NFT')
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
        {/* Create Coin Button (Eligibility) */}
        {canCreateCoin && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowCoinModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiPlus className="mr-2" />
              Create Coin for this Post
            </button>
          </div>
        )}
        {/* Coin Creation Modal */}
        <Dialog open={showCoinModal} onClose={() => setShowCoinModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Overlay className="fixed inset-0 bg-black/40" />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
              <button
                onClick={() => setShowCoinModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX size={22} />
              </button>
              <Dialog.Title className="text-xl font-bold mb-4">Create Coin for this Post</Dialog.Title>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Coin Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={coinName}
                    onChange={e => setCoinName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Symbol</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={coinSymbol}
                    onChange={e => setCoinSymbol(e.target.value.toUpperCase())}
                    maxLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Initial Supply</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={coinSupply}
                    min={1}
                    onChange={e => setCoinSupply(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Royalty (%)</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={coinRoyalty}
                    min={0}
                    max={20}
                    onChange={e => setCoinRoyalty(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <textarea
                    className="input input-bordered w-full min-h-[60px]"
                    value={coinDesc}
                    onChange={e => setCoinDesc(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition mt-4"
                  onClick={() => {/* TODO: handle create coin */}}
                >
                  Create Coin
                </button>
              </form>
            </div>
          </div>
        </Dialog>
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
                      onClick={() => setShowCoinViewModal(true)}
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
                      {coinData.created_at ? formatDistanceToNow(new Date(coinData.created_at), { addSuffix: true }) : 'N/A'}
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
                      onClick={() => setShowCoinModal(true)}
                      disabled={!canCreateCoin}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <FiPlus className="mr-2" />
                      {canCreateCoin ? 'Create Coin for This Post' : 'Coin Already Created'}
                    </button>
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
            
            {/* NFT Collection Section */}
            {post.is_nft && nftData && (
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
                    {nftData?.token_id && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Token ID</p>
                        <p className="font-mono text-gray-900 dark:text-white">{nftData.token_id}</p>
                      </div>
                    )}
                    {nftData?.contract_address && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Contract Address</p>
                        <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                          {nftData.contract_address}
                        </p>
                      </div>
                    )}
                    {nftData?.price && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{nftData.price} ETH</p>
                      </div>
                    )}
                    {nftData?.max_supply && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Supply</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {nftData.current_supply || 0}/{nftData.max_supply}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Network Warning */}
                {address && chainId && chainId !== baseSepoliaConfig.id && (
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⚠️</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Wrong Network
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-300">
                            Please switch to {baseSepoliaConfig.name} to mint this NFT
                          </p>
                        </div>
                      </div>
                      <NetworkSwitcher />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCollect}
                    disabled={isMinting || isCollecting || !address || !nftData || (chainId && chainId !== baseSepoliaConfig.id)}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {!address ? (
                      <>
                        <FiUser className="mr-2" />
                        Connect Wallet to Collect
                      </>
                    ) : chainId && chainId !== baseSepoliaConfig.id ? (
                      <>
                        <FiStar className="mr-2" />
                        Switch to {baseSepoliaConfig.name}
                      </>
                    ) : isMinting || isCollecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <FiStar className="mr-2" />
                        Mint NFT
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
                  
                  {nftData?.contract_address && (
                    <a
                      href={`https://testnet.zora.co/collect/bsep:${nftData.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                    >
                      <FiExternalLink className="mr-2" />
                      View on Zora
                    </a>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By collecting this NFT, you're supporting the creator and becoming part of their journey
                  </p>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* Coin View Modal */}
      <CoinModal
        isOpen={showCoinViewModal}
        onClose={() => setShowCoinViewModal(false)}
        coin={coinData}
      />
    </motion.div>
  )
}