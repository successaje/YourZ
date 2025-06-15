'use client'

import Navigation from '@/components/Navigation'

export default function TokenizedPostsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Tokenized Posts</h1>

        <div className="space-y-12">
          {/* What are Tokenized Posts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What are Tokenized Posts?</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Tokenized posts are blog posts that have been minted as NFTs (Non-Fungible Tokens) on the Ethereum blockchain using Zora Protocol. Each post becomes a unique digital asset that can be owned, collected, and traded.
              </p>
              <div className="grid gap-6 md:grid-cols-3 mt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unique</h3>
                  <p className="text-gray-600 dark:text-gray-400">Each post is a one-of-a-kind digital asset</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Owned</h3>
                  <p className="text-gray-600 dark:text-gray-400">True ownership verified on the blockchain</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tradable</h3>
                  <p className="text-gray-600 dark:text-gray-400">Buy, sell, and trade posts in the marketplace</p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Benefits of Tokenized Posts</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">For Writers</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Direct monetization of your content</li>
                  <li>Set your own prices and royalties</li>
                  <li>Build a loyal collector base</li>
                  <li>Earn from secondary sales</li>
                  <li>Maintain creative control</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">For Collectors</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Own unique digital content</li>
                  <li>Support your favorite writers</li>
                  <li>Potential for value appreciation</li>
                  <li>Access to exclusive content</li>
                  <li>Participate in the creator economy</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How Tokenization Works</h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">The Process</h3>
                <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Write your post in our Medium-style editor</li>
                  <li>Set your mint price and royalties</li>
                  <li>Content is stored on IPFS (decentralized storage)</li>
                  <li>Post is minted as an ERC-721 NFT on Zora Protocol</li>
                  <li>Your post is now available for collection</li>
                </ol>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Technical Details</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Built on Ethereum blockchain</li>
                  <li>Uses Zora Protocol for NFT creation</li>
                  <li>IPFS for decentralized content storage</li>
                  <li>ERC-721 standard for NFT compatibility</li>
                  <li>Smart contracts for automated royalties</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Getting Started</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">For Writers</h3>
                  <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2">
                    <li>Connect your Ethereum wallet</li>
                    <li>Create your profile</li>
                    <li>Write your first post</li>
                    <li>Set your mint price</li>
                    <li>Mint and share with your audience</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">For Collectors</h3>
                  <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2">
                    <li>Connect your Ethereum wallet</li>
                    <li>Browse the marketplace</li>
                    <li>Find posts you love</li>
                    <li>Collect with one click</li>
                    <li>Build your collection</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 