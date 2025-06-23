'use client'

import { useState, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient, useChainId,  } from 'wagmi'
import { baseSepolia } from 'viem/chains'
import { uploadToIPFS } from '../utils/ipfs'
import { deployZora1155Contract } from '../utils/zora1155-simple'

export function useZora() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const createNFT = async ({
    name,
    description = 'YourZ NFT Collection',
    image,
    symbol = 'YOURZ',
    royaltyBps = 100, // 1% default
    royaltyRecipient,
  }: {
    name: string
    description?: string
    image: File | string
    symbol?: string
    royaltyBps?: number
    royaltyRecipient?: `0x${string}`
  }) => {
    if (!publicClient || !walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      // 1. Upload image to IPFS
      const uploadFileToIpfs = async (file: File | string) => {
        if (typeof file === 'string') return file; // Already a URL
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/ipfs/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        return data.url;
      };

      // 2. Upload JSON to IPFS
      const uploadJsonToIpfs = async (json: any) => {
        const response = await fetch('/api/ipfs/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });
        const data = await response.json();
        return data.url;
      };

      // 3. Deploy the contract using the simplified approach
      const { contractAddress, parameters } = await deployZora1155Contract({
        name,
        description,
        image,
        publicClient,
        account: address,
        uploadFileToIpfs,
        uploadJsonToIpfs,
      });

      // 4. Send the transaction
      const hash = await walletClient.sendTransaction({
        to: parameters.to as `0x${string}`,
        data: parameters.data as `0x${string}`,
        value: BigInt(parameters.value?.toString() || '0'),
        account: address as `0x${string}`,
        chain: baseSepolia,
      });

      console.log('Transaction sent with hash:', hash);

      // 5. Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      if (!receipt.contractAddress) {
        throw new Error('No contract address in receipt');
      }

      console.log('Contract deployed at:', receipt.contractAddress);

      return {
        contractAddress: receipt.contractAddress,
        txHash: receipt.transactionHash,
      };;
    } catch (error) {
      console.error('Error in createNFT:', {
        error,
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
      
      const errorMessage = error?.message || 'Failed to create NFT contract';
      const enhancedError = new Error(errorMessage);
      enhancedError.name = 'NFTContractCreationError';
      if (error?.stack) {
        enhancedError.stack = error.stack;
      }
      throw enhancedError;
    }
  }

  const mintNFT = async ({
    contractAddress,
    tokenId,
    quantity = 1,
    tokenURI,
  }: {
    contractAddress: string
    tokenId: string
    quantity?: number
    tokenURI: string
  }) => {
    if (!address || !publicClient || !walletClient) {
      throw new Error('Wallet not connected')
    }

    try {
      // In a real implementation, this would use the Zora SDK to mint an NFT
      console.log(`Minting ${quantity} of token ${tokenId} from ${contractAddress}`)
      
      // Mock implementation - in a real app, this would be a blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate network delay
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
      }
    } catch (error) {
      console.error('Error minting NFT:', error)
      throw error
    }
  }

  const collectPost = async (postId: string, price: string) => {
    if (!address) {
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
    mintNFT,
    collectPost,
    fetchAllNFTs,
    fetchNFTDetails,
    resellPost,
  }
}