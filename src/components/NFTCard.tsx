import Link from 'next/link'
import { FaExternalLinkAlt, FaEthereum, FaUsers } from 'react-icons/fa'
import { useState } from 'react'
import NFTModal from './NFTModal'

interface NFT {
  id: string
  post_id: string
  contract_address: string
  token_id: string
  name: string
  description: string
  image_url: string
  metadata_uri: string
  price: number
  max_supply: number
  current_supply: number
  creator_id: string
  creator_address: string
  status: string
  minted_at: string
  created_at: string
  updated_at: string
  posts?: {
    title: string
    content: string
    created_at: string
  }
}

interface NFTCardProps {
  nft: NFT
}

export default function NFTCard({ nft }: NFTCardProps) {
  const [showModal, setShowModal] = useState(false)

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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer group" onClick={() => setShowModal(true)}>
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
          {nft.image_url ? (
            <img
              src={nft.image_url.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={nft.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-4xl">🖼️</div>
            </div>
          )}
          
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(nft.status)}`}>
              {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
            </span>
          </div>

          {/* Click indicator */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-gray-800/90 rounded-full p-3">
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {nft.name}
            </h3>
            <Link
              href={`https://sepolia.basescan.org/token/${nft.contract_address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FaExternalLinkAlt className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {nft.description || 'No description available'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {nft.current_supply}/{nft.max_supply}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Minted</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                <FaEthereum className="w-4 h-4" />
                {nft.price ? (nft.price / 1e18).toFixed(4) : '0'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
            </div>
          </div>

          {/* Contract info */}
          <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>Contract:</span>
              <span className="font-mono">{formatAddress(nft.contract_address)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Token ID:</span>
              <span className="font-mono">{nft.token_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Created:</span>
              <span>{formatDate(nft.created_at)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <Link
              href={`/post/${nft.post_id}`}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              View Post
            </Link>
            <Link
              href={`https://testnet.zora.co/collect/bsep:${nft.contract_address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              View on Zora
            </Link>
          </div>
        </div>
      </div>

      {/* NFT Modal */}
      <NFTModal
        nft={nft}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
} 