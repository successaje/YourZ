import { NFT } from '@/types/nft'
import Image from 'next/image'
import Link from 'next/link'
import { formatEther } from 'viem'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'

interface NFTCardProps {
  nft: NFT
}

export default function NFTCard({ nft }: NFTCardProps) {
  const { address } = useAccount()
  const isOwner = address?.toLowerCase() === nft.owner.address.toLowerCase()
  const priceInEth = parseFloat(nft.price) ? formatEther(BigInt(nft.price)) : '0'

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <Link href={`/nft/${nft.contractAddress}/${nft.tokenId}`}>
        <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-700">
          {nft.imageUrl ? (
            <Image
              src={nft.imageUrl}
              alt={nft.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          {nft.remaining !== undefined && nft.supply > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              {nft.remaining} of {nft.supply} remaining
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/nft/${nft.contractAddress}/${nft.tokenId}`}>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {nft.title || `#${nft.tokenId}`}
            </h3>
          </Link>
          {nft.collection && (
            <Link 
              href={`/collection/${nft.collection.id}`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {nft.collection.name}
            </Link>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {priceInEth} ETH
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Creator Royalty</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {(nft.royaltyBps / 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                {nft.creator.avatar ? (
                  <Image
                    src={nft.creator.avatar}
                    alt={nft.creator.name || 'Creator'}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">
                    {nft.creator.name?.[0] || nft.creator.address.slice(2, 4).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {nft.creator.name || `${nft.creator.address.slice(0, 6)}...${nft.creator.address.slice(-4)}`}
              </span>
            </div>
            
            {isOwner ? (
              <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg">
                Your NFT
              </button>
            ) : (
              <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Buy Now
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
