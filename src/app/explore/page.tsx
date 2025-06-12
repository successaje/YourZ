'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
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
  },
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
  },
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filteredPosts = MOCK_POSTS.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Explore Posts</h1>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <select
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Tags</option>
              <option value="web3">Web3</option>
              <option value="nft">NFT</option>
              <option value="blockchain">Blockchain</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No posts found
            </h2>
            <p className="text-gray-600">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </main>
    </div>
  )
} 