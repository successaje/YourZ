import { useState } from 'react'
import { motion } from 'framer-motion'
import { createCreatorClient, createCollectorClient } from "@zoralabs/protocol-sdk"
import { useAccount, usePublicClient } from 'wagmi'

export default function ZoraIntegration() {
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const handleCreateNFT = async () => {
    if (!address || !publicClient) return
    setIsLoading(true)
    try {
      const creatorClient = createCreatorClient({ 
        chainId: publicClient.chain.id, 
        publicClient 
      })

      // Create a new 1155 contract
      const { parameters } = await creatorClient.create1155({
        name: "My Collection",
        symbol: "MYNFT",
        royaltyBps: 500, // 5%
        royaltyRecipient: address,
      })

      // TODO: Handle the transaction
      console.log('Create NFT parameters:', parameters)
    } catch (error) {
      console.error('Error creating NFT:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCreateNFT}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-black dark:text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
    >
      {isLoading ? 'Creating...' : 'Create NFT'}
    </motion.button>
  )
} 