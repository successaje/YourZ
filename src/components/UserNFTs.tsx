'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useNFTService } from '@/hooks/useNFTService'
import { NFTDetails, UserNFTStats } from '@/services/nftService'
import { FiStar, FiTrendingUp, FiUsers, FiDollarSign, FiClock } from 'react-icons/fi'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import NFTCard from './NFTCard'

interface UserNFTsProps {
  userAddress?: string
  className?: string
}

// Convert NFTDetails to the format expected by NFTCard
const convertNFTDetailsToNFTCard = (nft: NFTDetails) => ({
  id: nft.id || '',
  post_id: nft.post_id,
  contract_address: nft.contract_address,
  token_id: nft.token_id,
  name: nft.name,
  description: nft.description || '',
  image_uri: nft.image_uri || '',
  metadata_uri: nft.metadata_uri || '',
  price: nft.price || 0,
  max_supply: nft.max_supply || 0,
  current_supply: nft.current_supply || 0,
  creator_id: nft.creator_id || '',
  creator_address: nft.creator_address,
  status: nft.status || 'minted',
  minted_at: nft.minted_at || '',
  created_at: nft.created_at || '',
  updated_at: nft.updated_at || '',
  posts: nft.posts
})

export default function UserNFTs({ userAddress, className = '' }: UserNFTsProps) {
  const { address } = useAccount()
  const { getUserNFTs, getUserNFTStats, isLoading } = useNFTService()
  
  const [nfts, setNfts] = useState<NFTDetails[]>([])
  const [stats, setStats] = useState<UserNFTStats | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const targetAddress = userAddress || address

  useEffect(() => {
    const fetchData = async () => {
      if (!targetAddress) return

      setIsLoadingData(true)
      try {
        const [nftsResult, statsResult] = await Promise.all([
          getUserNFTs(targetAddress),
          getUserNFTStats(targetAddress)
        ])

        if (nftsResult.success) {
          setNfts(nftsResult.data || [])
        } else {
          console.error('Failed to fetch NFTs:', nftsResult.error)
        }

        if (statsResult.success) {
          setStats(statsResult.data || null)
        } else {
          console.error('Failed to fetch stats:', statsResult.error)
        }
      } catch (error) {
        console.error('Error fetching user NFT data:', error)
        toast.error('Failed to load NFT data')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [targetAddress, getUserNFTs, getUserNFTStats])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatPrice = (price: number) => {
    return `${price} ETH`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!targetAddress) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Connect your wallet to view your NFTs
        </p>
      </div>
    )
  }

  if (isLoadingData) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            My NFTs
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {targetAddress === address ? 'Your' : `${formatAddress(targetAddress)}'s`} NFT collection
          </p>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
          <FiStar className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FiStar className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400">Total NFTs</span>
            </div>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {stats.total_nfts}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FiDollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">Total Value</span>
            </div>
            <p className="text-xl font-bold text-green-900 dark:text-green-100">
              {formatPrice(stats.total_value)}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FiTrendingUp className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-600 dark:text-yellow-400">Avg Price</span>
            </div>
            <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
              {formatPrice(stats.avg_price)}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FiUsers className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600 dark:text-purple-400">Listed</span>
            </div>
            <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
              {stats.listed_count}
            </p>
          </div>
        </div>
      )}

      {/* NFTs Grid */}
      {nfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <NFTCard key={nft.id} nft={convertNFTDetailsToNFTCard(nft)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiStar className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No NFTs yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {targetAddress === address 
              ? "You haven't created any NFTs yet. Start by minting one of your posts!"
              : "This user hasn't created any NFTs yet."
            }
          </p>
          {targetAddress === address && (
            <Link
              href="/write"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              <FiStar className="mr-2" />
              Create Your First NFT
            </Link>
          )}
        </div>
      )}
    </div>
  )
} 