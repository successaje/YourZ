'use client'

import { useState } from 'react'
import { FiExternalLink, FiCopy, FiCheck, FiImage } from 'react-icons/fi'
import { FaEthereum } from 'react-icons/fa'
import Link from 'next/link'
import NFTModal from '@/components/NFTModal'
import type { NFT } from '@/hooks/useAllNFTs'

interface NFTCardProps {
  nft: NFT
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatPrice = (price: number) => {
  if (!price) return '0 ETH'
  return `${(price / 1e18).toFixed(6)} ETH`
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'minted':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'listed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'sold':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'burned':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

export default function NFTCard({ nft }: NFTCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-500 to-indigo-600">
          {nft.image_uri ? (
            <img
              src={nft.image_uri.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={nft.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={() => setIsModalOpen(true)}>
              <FiImage className="w-16 h-16 text-white/50" />
            </div>
          )}
          
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(nft.status)}`}>
              {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
            </span>
          </div>

          {/* Price badge */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <FaEthereum className="w-3 h-3" />
              {formatPrice(nft.price)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {nft.name}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {nft.description || 'No description available'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {nft.current_supply}/{nft.max_supply}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Supply</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                #{nft.token_id}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Token ID</div>
            </div>
          </div>

          {/* Contract info */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Contract</span>
              <button
                onClick={() => copyToClipboard(nft.contract_address)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copied ? (
                  <FiCheck className="w-3 h-3 text-green-500" />
                ) : (
                  <FiCopy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
              {formatAddress(nft.contract_address)}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
            >
              View Details
            </button>
            
            <Link
              href={`/post/${nft.post_id}`}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-center"
            >
              View Post
            </Link>
          </div>
        </div>
      </div>

      {/* Modal */}
      <NFTModal
        nft={nft}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
} 