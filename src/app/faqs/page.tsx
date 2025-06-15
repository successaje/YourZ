'use client'

import Navigation from '@/components/Navigation'

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h1>

        <div className="space-y-8">
          {/* General Questions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">General Questions</h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">What is YourZ?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  YourZ is a next-generation blogging platform built on Zora Protocol where every post becomes a collectible NFT. It combines the best of Medium-style writing with Web3 ownership and monetization.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How do I get started?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Simply connect your Ethereum wallet, create a profile, and start writing or collecting posts. No email or password required - your wallet is your identity.
                </p>
              </div>
            </div>
          </section>

          {/* For Writers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">For Writers</h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How do I mint my post as an NFT?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  After writing your post, click the "Mint" button. You can set your mint price and royalties (e.g., 10% for secondary sales). The post will be stored on IPFS and minted as an ERC-721 NFT on Zora Protocol.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How do I earn money?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You earn from initial sales of your posts and receive royalties on secondary sales. You can also collaborate with other writers and split revenue automatically.
                </p>
              </div>
            </div>
          </section>

          {/* For Readers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">For Readers</h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How do I collect posts?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse through posts, find ones you like, and click "Collect". You'll need to approve the transaction in your wallet. Once collected, you own the NFT and can resell it.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Can I resell posts I've collected?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! You can resell any post you've collected in the secondary market. The original writer will receive their set royalty percentage from the sale.
                </p>
              </div>
            </div>
          </section>

          {/* Technical Questions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Technical Questions</h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Which wallets are supported?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We support all Ethereum wallets including MetaMask, Coinbase Wallet, Rainbow, and WalletConnect. Make sure you're on the Ethereum mainnet.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How are posts stored?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Posts are stored on IPFS (InterPlanetary File System) for decentralized storage, while the NFT metadata and ownership are managed on the Ethereum blockchain through Zora Protocol.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 