'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { Post } from '@/types'
import PostCard from '@/components/PostCard'

// Mock data for demonstration
const featuredPosts: Post[] = [
  {
    id: '1',
    title: 'The Future of Web3 Content Creation',
    content: 'Exploring how blockchain technology is revolutionizing content creation and monetization...',
    author: '0x123...',
    price: '0.1',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Building Your First NFT Collection',
    content: 'A comprehensive guide to creating and launching your first NFT collection...',
    author: '0x456...',
    price: '0.2',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Understanding Token Economics',
    content: 'Deep dive into token economics and how they shape the future of digital assets...',
    author: '0x789...',
    price: '0.15',
    timestamp: new Date().toISOString(),
  },
]

const categories = [
  { name: 'Blockchain', count: 128 },
  { name: 'Web3', count: 95 },
  { name: 'NFTs', count: 76 },
  { name: 'DeFi', count: 64 },
  { name: 'Technology', count: 52 },
  { name: 'Writing', count: 48 },
]

export default function HomePage() {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<'featured' | 'latest'>('featured')

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to YourZ
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            A Medium-style blogging platform where every post is minted as an NFT
          </p>
          <div className="flex justify-center space-x-4">
            <button className="btn-primary">Start Writing</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Posts</h2>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors">
              Latest
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors">
              Popular
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors">
              Following
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
} 