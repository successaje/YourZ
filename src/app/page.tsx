'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { Post } from '@/types'
import PostCard from '@/components/PostCard'
import { HeroIllustration } from '@/components/HeroIllustration'
import { BannerSlider } from '@/components/BannerSlider'
import { RecommendedArtists } from '@/components/RecommendedArtists'

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

type FilterType = 'featured' | 'latest' | 'popular' | 'following'

export default function Home() {
  const { address } = useAccount()
  const [activeFilter, setActiveFilter] = useState<FilterType>('featured')

  const filters = [
    { id: 'featured', label: 'Featured Posts' },
    { id: 'latest', label: 'Latest Posts' },
    { id: 'popular', label: 'Popular Posts' },
    { id: 'following', label: 'Following' }
  ] as const

  return (
    <main className="flex-1">
      {/* Banner Section */}
      <section className="w-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 dark:from-primary/5 dark:via-purple-500/5 dark:to-blue-500/5 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <BannerSlider />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Filter Section */}
              <div className="flex items-center space-x-4 mb-8 overflow-x-auto pb-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                      ${activeFilter === filter.id 
                        ? 'bg-primary text-white shadow-md shadow-primary/20 dark:shadow-primary/10' 
                        : 'bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50'
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="p-6">
                {activeFilter === 'featured' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {featuredPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
                {activeFilter === 'latest' && (
                  <div className="space-y-6">
                    {/* Latest post cards will go here */}
                  </div>
                )}
                {activeFilter === 'popular' && (
                  <div className="space-y-6">
                    {/* Popular post cards will go here */}
                  </div>
                )}
                {activeFilter === 'following' && (
                  <div className="space-y-6">
                    {/* Following post cards will go here */}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Recommended Artists */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Create Button */}
                <Link
                  href="/write"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  ✍️ Start Creating
                </Link>

                {/* Recommended Artists */}
                <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300 p-6">
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-6">
                    Recommended Artists
                  </h2>
                  <RecommendedArtists />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 