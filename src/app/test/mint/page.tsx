'use client'

import { useState } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { toast } from 'react-hot-toast'
import { useNFTMinting } from '@/hooks/useNFTMinting'
import { supabase } from '@/lib/supabase'
import { testMint } from '@/utils/test-mint'

export default function MintTestPage() {
  const { address } = useAccount()
  const { mintNFT, getNFTData, isMinting } = useNFTMinting()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [postId, setPostId] = useState('')
  const [nftData, setNftData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTestMinting, setIsTestMinting] = useState(false)

  const fetchNFTData = async () => {
    if (!postId) {
      toast.error('Please enter a post ID')
      return
    }

    setIsLoading(true)
    try {
      const data = await getNFTData(postId)
      if (data) {
        setNftData(data)
        toast.success('NFT data fetched successfully')
      } else {
        toast.error('No NFT data found for this post')
        setNftData(null)
      }
    } catch (error) {
      console.error('Error fetching NFT data:', error)
      toast.error('Failed to fetch NFT data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMint = async () => {
    if (!nftData) {
      toast.error('No NFT data available')
      return
    }

    try {
      const result = await mintNFT({
        contractAddress: nftData.contract_address,
        tokenId: nftData.token_id,
        price: nftData.price?.toString() || '0',
        maxSupply: nftData.max_supply,
        currentSupply: nftData.current_supply,
        postTitle: nftData.name,
        postId: nftData.post_id
      })

      if (result.success) {
        toast.success('NFT minted successfully!')
        // Refresh NFT data
        fetchNFTData()
      } else {
        toast.error(result.error || 'Failed to mint NFT')
      }
    } catch (error) {
      console.error('Error minting NFT:', error)
      toast.error('Failed to mint NFT')
    }
  }

  const handleTestMint = async () => {
    if (!nftData || !walletClient || !publicClient || !address) {
      toast.error('Missing required data for test mint')
      return
    }

    setIsTestMinting(true)
    try {
      const result = await testMint({
        contractAddress: nftData.contract_address,
        tokenId: nftData.token_id,
        walletClient,
        publicClient,
        account: address
      })

      if (result.success) {
        toast.success('Test mint successful!')
        // Refresh NFT data
        fetchNFTData()
      } else {
        toast.error(result.error || 'Test mint failed')
      }
    } catch (error) {
      console.error('Error in test mint:', error)
      toast.error('Test mint failed')
    } finally {
      setIsTestMinting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">NFT Minting Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Fetch NFT Data</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              placeholder="Enter Post ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchNFTData}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Fetch NFT Data'}
            </button>
          </div>
        </div>

        {nftData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">NFT Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">{nftData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contract Address</p>
                <p className="font-mono text-sm">{nftData.contract_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Token ID</p>
                <p className="font-semibold">{nftData.token_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-semibold">{nftData.price} ETH</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supply</p>
                <p className="font-semibold">{nftData.current_supply}/{nftData.max_supply}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{nftData.status}</p>
              </div>
            </div>
            
            <button
              onClick={handleMint}
              disabled={isMinting || !address || nftData.current_supply >= nftData.max_supply}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!address ? 'Connect Wallet to Mint' : 
               isMinting ? 'Minting...' : 
               nftData.current_supply >= nftData.max_supply ? 'Max Supply Reached' :
               'Mint NFT'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Enter a Post ID that has an associated NFT</li>
            <li>Click "Fetch NFT Data" to load the NFT information</li>
            <li>Review the NFT details</li>
            <li>Click "Mint NFT" to mint the NFT to your wallet</li>
            <li>Make sure you have enough ETH for gas fees</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 