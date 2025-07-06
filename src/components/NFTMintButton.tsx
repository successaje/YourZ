'use client'

import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { toast } from 'react-hot-toast'
import { createCollectorClient } from '@zoralabs/protocol-sdk'
import { baseSepolia } from 'viem/chains'

interface NFTMintButtonProps {
  contractAddress: string
  tokenId: string
  price: string
  maxSupply: number
  currentSupply: number
  postTitle: string
  onMintSuccess?: () => void
}

export default function NFTMintButton({
  contractAddress,
  tokenId,
  price,
  maxSupply,
  currentSupply,
  postTitle,
  onMintSuccess
}: NFTMintButtonProps) {
  const [isMinting, setIsMinting] = useState(false)
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const remainingSupply = maxSupply - currentSupply
  const isSoldOut = remainingSupply <= 0

  const handleMint = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    if (!address || !publicClient || !walletClient) {
      toast.error('Wallet not connected')
      return
    }

    if (isSoldOut) {
      toast.error('This NFT collection is sold out!')
      return
    }

    setIsMinting(true)

    try {
      toast.loading('Minting NFT...', { id: 'minting' })

      // Create collector client for minting
      const collectorClient = createCollectorClient({
        chainId: baseSepolia.id,
        publicClient,
      })

      // Prepare mint transaction
      const { parameters } = await collectorClient.mint({
        tokenContract: contractAddress as `0x${string}`,
        mintType: '1155',
        tokenId: BigInt(tokenId),
        quantityToMint: 1,
        minterAccount: address,
      })

      // Execute mint transaction
      const hash = await walletClient.writeContract(parameters)
      
      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status !== 'success') {
        throw new Error('Mint transaction failed')
      }

      toast.success('NFT minted successfully!', { id: 'minting' })
      
      if (onMintSuccess) {
        onMintSuccess()
      }

      // Open transaction in explorer
      const explorerLink = `https://sepolia.basescan.org/tx/${receipt.transactionHash}`
      window.open(explorerLink, '_blank')
    } catch (error) {
      console.error('Error minting NFT:', error)
      toast.error('Failed to mint NFT', { id: 'minting' })
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mint NFT
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentSupply} / {maxSupply} minted
        </span>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {price} ETH
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Remaining:</span>
          <span className={`text-sm font-medium ${
            remainingSupply > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {remainingSupply} available
          </span>
        </div>
      </div>

      <button
        onClick={handleMint}
        disabled={isMinting || isSoldOut || !isConnected}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          isSoldOut
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            : isMinting
            ? 'bg-blue-400 text-white cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isMinting ? 'Minting...' : isSoldOut ? 'Sold Out' : 'Mint NFT'}
      </button>

      {!isConnected && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Connect wallet to mint
        </p>
      )}
    </div>
  )
} 