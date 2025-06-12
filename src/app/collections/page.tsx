'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import PostCard from '@/components/PostCard'

// Mock data for demonstration
const MOCK_COLLECTIONS = [
  {
    id: '1',
    title: 'Getting Started with Web3 Development',
    excerpt: 'Learn the basics of Web3 development and how to build decentralized applications...',
    author: {
      name: 'Alice',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    createdAt: new Date('2024-03-15'),
    price: '0.01',
    minted: 5,
    totalSupply: 100,
    collectedAt: new Date('2024-03-16'),
  },
]

export default function CollectionsPage() {
  const { isConnected } = useAccount()
  const [sortBy, setSortBy] = useState<'recent' | 'value'>('recent')

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Your Wallet to View Collections
          </h1>
          <p className="text-gray-600 mb-8">
            You need to connect your wallet to view your collected posts.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  const sortedCollections = [...MOCK_COLLECTIONS].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.collectedAt.getTime() - a.collectedAt.getTime()
    }
    return parseFloat(b.price) - parseFloat(a.price)
  })

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">My Collections</h1>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'value')}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="recent">Most Recent</option>
            <option value="value">Highest Value</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedCollections.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>

        {sortedCollections.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No collections yet
            </h2>
            <p className="text-gray-600">
              Start collecting posts to see them here.
            </p>
          </div>
        )}
      </main>
    </div>
  )
} 