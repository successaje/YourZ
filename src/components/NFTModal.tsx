'use client'

import { useState, useEffect } from 'react'
import { 
  FiX, 
  FiExternalLink, 
  FiCopy, 
  FiCheck, 
  FiImage,
  FiFileText
} from 'react-icons/fi'
import { FaEthereum } from 'react-icons/fa'
import Link from 'next/link'

interface NFT {
  id: string
  post_id: string
  contract_address: string
  token_id: string
  name: string
  description: string
  image_uri: string
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

interface NFTModalProps {
  nft: NFT | null
  isOpen: boolean
  onClose: () => void
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
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

export default function NFTModal({ nft, isOpen, onClose }: NFTModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  if (!nft || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-br from-purple-500 to-indigo-600 flex-shrink-0">
            {nft.image_uri ? (
              <img
                src={nft.image_uri.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                alt={nft.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiImage className="w-16 h-16 text-white/50" />
              </div>
            )}
            
            {/* Status badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(nft.status)}`}>
                {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 md:p-8">
              {/* Title and basic info */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {nft.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                  {nft.description || 'No description available'}
                </p>
                
                {/* Quick stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                      <FaEthereum className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatPrice(nft.price)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      {nft.current_supply}/{nft.max_supply}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Supply</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      #{nft.token_id}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Token ID</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {formatDate(nft.created_at)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                  </div>
                </div>
              </div>

              {/* Detailed information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Contract Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiFileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    Contract Information
                  </h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Contract Address</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white">
                          {formatAddress(nft.contract_address)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(nft.contract_address, 'contract')}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedField === 'contract' ? (
                            <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                          ) : (
                            <FiCopy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Creator Address</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white">
                          {formatAddress(nft.creator_address)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(nft.creator_address, 'creator')}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedField === 'creator' ? (
                            <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                          ) : (
                            <FiCopy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Metadata URI</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white truncate max-w-24 sm:max-w-32">
                          {nft.metadata_uri ? formatAddress(nft.metadata_uri) : 'N/A'}
                        </span>
                        {nft.metadata_uri && (
                          <button
                            onClick={() => copyToClipboard(nft.metadata_uri, 'metadata')}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            {copiedField === 'metadata' ? (
                              <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                            ) : (
                              <FiCopy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiFileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    Additional Details
                  </h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Minted At</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                        {nft.minted_at ? formatDate(nft.minted_at) : 'Not minted yet'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                        {formatDate(nft.updated_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">NFT ID</span>
                      <span className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white">
                        {nft.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Link
                  href={`/post/${nft.post_id}`}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-center text-sm sm:text-base"
                >
                  <FiFileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                  View Original Post
                </Link>
                
                <Link
                  href={`https://sepolia.basescan.org/token/${nft.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-center text-sm sm:text-base"
                >
                  <FiExternalLink className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                  View on Explorer
                </Link>
                
                <Link
                  href={`https://testnet.zora.co/collect/bsep:${nft.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 text-center text-sm sm:text-base"
                >
                  <FiCheck className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                  View on Zora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 