'use client'

import Navigation from '@/components/Navigation'

export default function HowToEarnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">How to Earn</h1>

        <div className="space-y-12">
          {/* For Writers Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">For Writers</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Initial Sales</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Set your own mint price for your posts</li>
                  <li>Receive 100% of the initial sale proceeds</li>
                  <li>Control your pricing strategy</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Royalties</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Earn royalties on secondary sales (e.g., 10%)</li>
                  <li>Passive income from your content</li>
                  <li>Benefit from content appreciation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* For Readers Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">For Readers</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Early Collection</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Collect posts from promising writers early</li>
                  <li>Support creators you believe in</li>
                  <li>Build a valuable collection</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Secondary Sales</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Resell posts in the secondary market</li>
                  <li>Profit from content appreciation</li>
                  <li>Participate in the creator economy</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Collaborative Earnings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Collaborative Earnings</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Revenue Splits</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Split revenue with co-authors automatically</li>
                <li>Set custom split percentages</li>
                <li>Earn from collaborative content</li>
                <li>Build writing teams and share profits</li>
              </ul>
            </div>
          </section>

          {/* Tips for Success */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tips for Success</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">For Writers</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Create high-quality, unique content</li>
                  <li>Engage with your readers</li>
                  <li>Set reasonable initial prices</li>
                  <li>Build a consistent publishing schedule</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">For Collectors</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Research writers and their track record</li>
                  <li>Diversify your collection</li>
                  <li>Engage in the community</li>
                  <li>Look for unique and valuable content</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 