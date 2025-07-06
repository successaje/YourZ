'use client'

import { Suspense, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { BannerSlider } from '@/components/BannerSlider'
import { RecommendedArtists } from '@/components/RecommendedArtists'
import { UserEarnings } from '@/components/UserEarnings'
import PostsList from '@/components/PostsList'
import TrendingCoins from '@/components/TrendingCoins'
import AvailableCollections from '@/components/AvailableCollections'
import { Clock, Flame, Star, Users, Zap, TrendingUp, BookOpen, Award, Calendar } from 'lucide-react'

export default function Home() {
  const { address } = useAccount()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [activeFilter, setActiveFilter] = useState('featured')

  const filterTabs = [
    { id: 'featured', label: 'Featured', icon: <Star className="h-4 w-4" /> },
    { id: 'latest', label: 'Latest', icon: <Clock className="h-4 w-4" /> },
    { id: 'trending', label: 'Trending', icon: <Flame className="h-4 w-4" /> },
    { id: 'popular', label: 'Popular', icon: <TrendingUp className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner Slider */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 py-8 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <BannerSlider />
            </div>
            <div className="hidden md:block ml-8">
              <Link 
                href="/write" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
              >
                Start creating
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3">
            {/* Filter Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeFilter === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content based on active filter */}
            <div className="mb-8">
              <Suspense fallback={
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              }>
                <PostsList 
                  showFeatured={activeFilter === 'featured'} 
                  limit={15} 
                  category={activeFilter as 'featured' | 'latest' | 'trending' | 'popular'}
                />
              </Suspense>
            </div>

            {/* Load More Button */}
            <div className="text-center py-8">
              <button 
                className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                onClick={() => {
                  setIsLoadingMore(true)
                  // Simulate loading more posts
                  setTimeout(() => setIsLoadingMore(false), 1000)
                }}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Trending Coins - Moved Up */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🪙</span>
                </span>
                Trending Coins
              </h3>
              <TrendingCoins />
            </div>

            {/* Available Collections - New */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🖼️</span>
                </span>
                Available Collections
              </h3>
              <AvailableCollections />
            </div>

            {/* User Earnings */}
            {address && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <UserEarnings />
              </div>
            )}
            
            {/* Platform Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Platform Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Posts</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Writers</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">342</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Coins Created</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">+23</span>
                </div>
              </div>
            </div>
            
            {/* Recommended Artists */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recommended Creators</h3>
              <RecommendedArtists />
            </div>
            
            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-sm text-blue-100 mb-4">Get the latest posts and updates delivered to your inbox.</p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-white/20 placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/write"
                  className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Write a Post
                </Link>
                <Link
                  href="/marketplace"
                  className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Browse Marketplace
                </Link>
                <Link
                  href="/coins"
                  className="block w-full px-4 py-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-center rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors font-medium"
                >
                  View All Coins
                </Link>
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