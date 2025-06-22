'use client'

import { useCallback } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { createCreatorClient, getCollection, getToken } from '@zoralabs/protocol-sdk'
import { zora } from 'viem/chains'
import { parseEther } from 'viem'
import { NFT } from '@/types/nft'

export function useZora() {
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const createNFT = async ({
    name,
    symbol,
    royaltyBps,
    tokenURI,
    mintPrice,
  }: {
    name: string
    symbol: string
    royaltyBps: number
    tokenURI: string
    mintPrice: string
  }) => {
    if (!address || !publicClient) {
      throw new Error('Wallet not connected')
    }

    // Patch: always use baseSepoliaConfig as chain, and ensure publicClient has correct chain property
    // Import baseSepoliaConfig from your chain config file
    import { baseSepoliaConfig } from '@/utils/zora';
    // If publicClient.chain is undefined, patch it
    const fixedPublicClient = {
      ...publicClient,
      chain: publicClient.chain ?? baseSepoliaConfig,
    };
    const creatorClient = createCreatorClient({
      chain: baseSepoliaConfig,
      publicClient: fixedPublicClient,
    })

    const { request } = await creatorClient.createNew1155Contract({
      name,
      symbol,
      royaltyBps,
      royaltyRecipient: address,
      tokenURI,
      mintPrice,
    })

    return request
  }

  const fetchAllNFTs = useCallback(async (): Promise<NFT[]> => {
    if (!publicClient) return []

    try {
      // In a real implementation, you would query the Zora API or subgraph here
      // This is a mock implementation for demonstration
      const mockNFTs: NFT[] = [
        {
          id: '1',
          tokenId: '1',
          contractAddress: '0x123...',
          title: 'Genesis Post',
          description: 'The very first post minted on YourZ',
          imageUrl: 'https://placehold.co/600x400',
          price: parseEther('0.01').toString(),
          royaltyBps: 1000, // 10%
          creator: {
            address: '0x123...',
            name: 'Creator Name',
            avatar: 'https://placehold.co/100x100',
          },
          owner: {
            address: '0x456...',
            name: 'Collector',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 100,
          remaining: 87,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://placehold.co/200x200',
          },
        },
        // Add more mock NFTs as needed
      ]

      return mockNFTs
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      return []
    }
  }, [publicClient])

  const fetchNFTDetails = useCallback(async (contractAddress: string, tokenId: string): Promise<NFT | null> => {
    if (!publicClient) return null

    try {
      // In a real implementation, fetch the actual NFT details
      // This is a mock implementation
      return {
        id: `${contractAddress}-${tokenId}`,
        tokenId,
        contractAddress,
        title: `Post #${tokenId}`,
        description: 'A minted post from YourZ platform',
        imageUrl: 'https://placehold.co/600x400',
        price: parseEther('0.01').toString(),
        royaltyBps: 1000, // 10%
        creator: {
          address: '0x123...',
          name: 'Creator Name',
          avatar: 'https://placehold.co/100x100',
        },
        owner: {
          address: '0x456...',
          name: 'Current Owner',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        supply: 1,
        remaining: 1,
        isListed: true,
      }
    } catch (error) {
      console.error('Error fetching NFT details:', error)
      return null
    }
  }, [publicClient])

  const collectPost = async (postId: string, price: string) => {
    if (!address || !publicClient) {
      throw new Error('Wallet not connected')
    }

    try {
      // In a real implementation, this would use the Zora SDK to collect an NFT
      console.log(`Collecting post ${postId} for ${price} ETH`)
      
      // Mock implementation - in a real app, this would be a blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate network delay
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
      }
    } catch (error) {
      console.error('Error collecting post:', error)
      throw error
    }
  }

  const resellPost = async (postId: string, price: string) => {
    if (!address || !publicClient) {
      throw new Error('Wallet not connected')
    }

    try {
      // In a real implementation, this would list the NFT for sale on a marketplace
      console.log(`Reselling post ${postId} for ${price} ETH`)
      
      // Mock implementation - in a real app, this would be a blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate network delay
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
      }
    } catch (error) {
      console.error('Error reselling post:', error)
      throw error
    }
  }

  return {
    createNFT,
    fetchAllNFTs,
    fetchNFTDetails,
    collectPost,
    resellPost,
  }
} 