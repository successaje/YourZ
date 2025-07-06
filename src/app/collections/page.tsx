'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAllNFTs } from '@/hooks/useAllNFTs'
import NFTCard from '@/components/collections/NFTCard'
import { FiLoader, FiAlertCircle } from 'react-icons/fi'
import Link from 'next/link'

export default function CollectionsPage() {
  const { isConnected } = useAccount()
  const { nfts, loading, error } = useAllNFTs()
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'name'>('recent')

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet to View Collections
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            You need to connect your wallet to view all NFT collections.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  const sortedNFTs = [...nfts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'price':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FiLoader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading NFT collections...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FiAlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Collections
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All NFT Collections
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Explore all NFTs created on YourZ platform
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{nfts.length}</div>
              <div className="text-sm opacity-90">Total NFTs</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {nfts.filter(nft => nft.status === 'minted').length}
              </div>
              <div className="text-sm opacity-90">Minted</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {nfts.filter(nft => nft.status === 'listed').length}
              </div>
              <div className="text-sm opacity-90">Listed</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {nfts.reduce((total, nft) => total + nft.current_supply, 0)}
              </div>
              <div className="text-sm opacity-90">Total Supply</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {sortedNFTs.length} NFT{sortedNFTs.length !== 1 ? 's' : ''}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'price' | 'name')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="recent">Most Recent</option>
            <option value="price">Highest Price</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedNFTs.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>

        {sortedNFTs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No NFTs found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              There are no NFTs in the collection yet.
            </p>
            <Link
              href="/write"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First NFT
            </Link>
          </div>
        )}
      </main>
    </div>
  )
} 