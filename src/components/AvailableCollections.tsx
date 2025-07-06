import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaLayerGroup, FaExternalLinkAlt, FaEye } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'
import NFTModal from './NFTModal'

interface Collection {
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
  }
}

export default function AvailableCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('post_nfts')
          .select(`*, posts!post_nfts_post_id_fkey (title)`)
          .order('created_at', { ascending: false })
          .limit(5)
        if (error) {
          console.error('Error fetching collections:', error)
          return
        }
        setCollections(data || [])
      } catch (err) {
        console.error('Error fetching collections:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCollections()
  }, [])

  const handleCollectionClick = (collection: Collection) => {
    setSelectedCollection(collection)
    setIsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <FaLayerGroup className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm">No collections created yet</p>
        <p className="text-xs mt-1">Be the first to create a collection!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleCollectionClick(collection)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FaLayerGroup className="w-3 h-3 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {collection.name}
                  </h4>
                </div>
                {collection.posts?.title && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                    From: {collection.posts.title}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Supply: {collection.current_supply}/{collection.max_supply}</span>
                  <span>Created: {formatDate(collection.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <Link
                  href={`https://testnet.zora.co/collect/bsep:${collection.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                  title="View on Zora"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaEye className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`https://sepolia.basescan.org/token/${collection.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  title="View on BaseScan"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaExternalLinkAlt className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        <div className="text-center pt-2">
          <Link
            href="/collections"
            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            View all collections →
          </Link>
        </div>
      </div>
      {/* NFT Modal */}
      <NFTModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nft={selectedCollection}
      />
    </>
  )
} 