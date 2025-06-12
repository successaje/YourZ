'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import PostCard from '@/components/PostCard'

// Mock data for demonstration
const MOCK_POSTS = [
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
    status: 'published',
  },
]

const MOCK_COLLECTIONS = [
  {
    id: '2',
    title: 'The Future of NFT Marketplaces',
    excerpt: 'Exploring the evolution of NFT marketplaces and their impact on digital ownership...',
    author: {
      name: 'Bob',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    createdAt: new Date('2024-03-14'),
    price: '0.02',
    minted: 3,
    totalSupply: 50,
    collectedAt: new Date('2024-03-16'),
  },
]

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'posts' | 'collections'>('posts')

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Your Wallet to Access Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            You need to connect your wallet to manage your posts and collections.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'posts'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              My Posts
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'collections'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              My Collections
            </button>
          </div>
          {activeTab === 'posts' && (
            <Link href="/write" className="btn-primary">
              Write New Post
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeTab === 'posts' ? (
            MOCK_POSTS.map((post) => <PostCard key={post.id} {...post} />)
          ) : (
            MOCK_COLLECTIONS.map((post) => <PostCard key={post.id} {...post} />)
          )}
        </div>

        {((activeTab === 'posts' && MOCK_POSTS.length === 0) ||
          (activeTab === 'collections' && MOCK_COLLECTIONS.length === 0)) && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'posts'
                ? 'No posts yet'
                : 'No collections yet'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'posts'
                ? 'Start writing to see your posts here.'
                : 'Start collecting posts to see them here.'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
} 