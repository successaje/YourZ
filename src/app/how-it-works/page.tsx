'use client'

import Navigation from '@/components/Navigation'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">How It Works</h1>

        <div className="space-y-12">
          {/* For Writers Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">For Writers</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Write</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Compose in a clean, Medium-style editor. Create engaging content that resonates with your audience.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Mint</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Turn your post into an NFT using Zora Protocol. Set your own mint price and royalties.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Earn</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get paid when readers collect your work or when it's resold in the secondary market.
                </p>
              </div>
            </div>
          </section>

          {/* For Readers Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">For Readers</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Discover</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse through tokenized posts and find content that resonates with you.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Collect</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Buy posts you believe in and support your favorite creators directly.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Profit</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Earn royalties if the post gains value and is resold in the secondary market.
                </p>
              </div>
            </div>
          </section>

          {/* Key Features Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Tokenized Blog Posts</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Every article is minted as an ERC-721 NFT (Zora Protocol)</li>
                  <li>Set your own mint price & royalties (e.g., 10% on resales)</li>
                  <li>Posts are stored permanently on IPFS (decentralized storage)</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Collaborative Writing</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Co-author posts with revenue splits (Zora's SplitMain)</li>
                  <li>Multi-signature publishing for teams</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Web3-Native Experience</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>No emails/passwords—sign in with your Ethereum wallet</li>
                  <li>ENS integration (yourname.eth as your identity)</li>
                  <li>Token-gated discussions (only NFT holders can comment)</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 