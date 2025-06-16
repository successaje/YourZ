'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { Post } from '@/types'
import PostCard from '@/components/PostCard'
import { BannerSlider } from '@/components/BannerSlider'
import { RecommendedArtists } from '@/components/RecommendedArtists'
import { UserEarnings } from '@/components/UserEarnings'

type FilterType = 'featured' | 'latest' | 'popular' | 'following'

const Home = () => {
  const { address } = useAccount()
  const [activeFilter, setActiveFilter] = useState<FilterType>('featured')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  const featuredPosts = [
    {
      id: '1',
      title: 'The Future of Web3 Content Creation',
      content: 'Exploring how blockchain technology is revolutionizing content creation and monetization.',
      metadata: { tags: ['web3', 'content creation', 'blockchain'] },
      status: 'published',
      is_nft: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      address: '0x123...',
      author_name: 'Alex Johnson',
      wallet_address: '0x123...',
      likes_count: 142,
      is_liked: false,
      is_bookmarked: false
    },
    {
      id: '2',
      title: 'Building Your First NFT Collection',
      content: 'A comprehensive guide to creating and launching your first NFT collection.',
      metadata: { tags: ['nft', 'tutorial', 'blockchain'] },
      status: 'published',
      is_nft: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      address: '0x456...',
      author_name: 'Sarah Chen',
      wallet_address: '0x456...',
      likes_count: 328,
      is_liked: false,
      is_bookmarked: false
    }
  ]

  const featuredPost = featuredPosts[0]
  const regularPosts = featuredPosts.slice(1)

  return (
    <div className="min-h-screen">
      {/* Banner Slider */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 py-8">
        <div className="container mx-auto px-4">
          <BannerSlider />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Post */}
            {featuredPost && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 md:w-1/2 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center p-8">
                    <span className="text-8xl font-bold text-white opacity-90">
                      {featuredPost.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="p-6 md:p-8 flex-1">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full">
                        Featured
                      </span>
                      {featuredPost.is_nft && (
                        <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded-full">
                          NFT
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                      {featuredPost.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {featuredPost.author_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {featuredPost.author_name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(featuredPost.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link 
                        href={`/posts/${featuredPost.id}`}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Post Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {[
                  { id: 'featured', label: 'Featured' },
                  { id: 'latest', label: 'Latest' },
                  { id: 'popular', label: 'Popular' },
                  { id: 'following', label: 'Following' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as FilterType)}
                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                      activeFilter === filter.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regularPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center">
              <button 
                onClick={() => setIsLoading(!isLoading)}
                disabled={isLoading}
                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Create Button */}
            <Link
              href="/write"
              className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white text-center py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              ✍️ Start Creating
            </Link>

            {/* Recommended Artists */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Recommended Creators
                </h2>
                <RecommendedArtists />
              </div>
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-center">
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  View All Creators
                </button>
              </div>
            </div>

            {/* User Earnings & Newsletter */}
            <div className="sticky top-6 space-y-6">
              <UserEarnings />
              
              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Stay Updated</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Get the latest posts and updates delivered to your inbox.
                </p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-4 py-2 text-sm rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-r-lg hover:bg-blue-700 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">YourZ</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                The decentralized platform for content creators and collectors.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Explore
              </h4>
              <ul className="space-y-2">
                {['Featured', 'Popular', 'Latest', 'Categories'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                {['Privacy', 'Terms', 'Cookie Policy', 'GDPR'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} YourZ. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Twitter', 'Discord', 'Telegram', 'GitHub'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label={social}
                >
                  <span className="sr-only">{social}</span>
                  <span className="w-5 h-5">
                    {social === 'Twitter' && '𝕏'}
                    {social === 'Discord' && '🛡️'}
                    {social === 'Telegram' && '✈️'}
                    {social === 'GitHub' && '🐙'}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home