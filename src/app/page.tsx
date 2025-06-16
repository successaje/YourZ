'use client'

import { Suspense } from 'react'
import { useAccount } from 'wagmi'
import { BannerSlider } from '@/components/BannerSlider'
import { RecommendedArtists } from '@/components/RecommendedArtists'
import { UserEarnings } from '@/components/UserEarnings'
import PostsList from '@/components/PostsList'

export default function Home() {
  const { address } = useAccount()

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
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            }>
              <PostsList showFeatured={true} limit={10} />
            </Suspense>
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* User Earnings */}
            {address && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <UserEarnings />
              </div>
            )}
            
            {/* Recommended Artists */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
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