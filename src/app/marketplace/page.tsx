'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { useZora } from '@/hooks/useZora'
import { NFT } from '@/types/nft'
import NFTGrid from '@/components/marketplace/NFTGrid'
import SearchAndFilter from '@/components/marketplace/SearchAndFilter'

export default function MarketplacePage() {
  const { address, isConnected } = useAccount()
  const { fetchAllNFTs } = useZora()
  
  const [nfts, setNfts] = useState<NFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high'>('recent')

  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setIsLoading(true)
        const allNfts = await fetchAllNFTs()
        setNfts(allNfts)
        setFilteredNfts(allNfts)
      } catch (error) {
        console.error('Failed to fetch NFTs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isConnected) {
      loadNFTs()
    }
  }, [isConnected, fetchAllNFTs])

  // Filter and sort NFTs
  useEffect(() => {
    let result = [...nfts]
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(nft => 
        nft.title.toLowerCase().includes(query) ||
        nft.creator.name?.toLowerCase().includes(query) ||
        nft.description?.toLowerCase().includes(query)
      )
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price)
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    
    setFilteredNfts(result)
  }, [nfts, searchQuery, sortBy])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your wallet to view and trade NFTs on the marketplace.
          </p>
          <w3m-connect-button />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            background: 'linear-gradient(270deg, #4f46e5, #7c3aed, #9333ea, #4f46e5)',
            backgroundSize: '300% 300%',
          }}
        />
        
        {/* Subtle floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: 'blur(40px)'
              }}
              animate={{
                y: [0, 50, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 20 + Math.random() * 20,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            NFT Marketplace
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-100 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Discover, collect, and trade unique content from your favorite creators.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <a 
              href="#marketplace" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-200"
            >
              Start Exploring
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SearchAndFilter 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredNfts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No NFTs found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Try a different search term' : 'No NFTs are available for trading yet'}
            </p>
          </div>
        ) : (
          <NFTGrid nfts={filteredNfts} />
        )}
      </div>
    </div>
  )
}
