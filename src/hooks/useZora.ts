'use client'

import { useState, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient, useChainId,  } from 'wagmi'
import { baseSepolia } from 'viem/chains'
import { uploadToIPFS } from '../utils/ipfs'
import { deployZora1155Contract, deployAnotherZora1155Contract } from '../utils/zora1155-simple'
import { NFT } from '@/types/nft'

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
      const { contractAddress, parameters } = await deployAnotherZora1155Contract({
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
    tokenId,
    quantity = 1,
    tokenURI,
  }: {
    tokenId: string
    quantity?: number
    tokenURI: string
  }) => {
    if (!address || !publicClient || !walletClient) {
      throw new Error('Wallet not connected')
    }

    try {
      const contractAddress = '0xD289FDef439d54eCb3a16d36A4b6B123A79DF9Bd' as `0x${string}`;
      
      console.log(`Minting ${quantity} of token ${tokenId} from ${contractAddress}`);
      
      // Prepare the mint transaction
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: [
          {
            inputs: [
              { internalType: 'address', name: 'to', type: 'address' },
              { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              { internalType: 'bytes', name: 'data', type: 'bytes' },
            ],
            name: 'mint',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'mint',
        args: [
          address, // to
          BigInt(tokenId), // tokenId
          BigInt(quantity), // amount
          '0x', // data (empty for now)
        ],
      });
      
      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      
      if (receipt.status !== 'success') {
        throw new Error('Transaction failed');
      }
      
      return {
        success: true,
        transactionHash: tx,
        tokenId,
        contractAddress,
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
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
      // Enhanced mock implementation with diverse NFTs
      const mockNFTs: NFT[] = [
        {
          id: '1',
          tokenId: '1',
          contractAddress: '0x1234567890123456789012345678901234567890',
          title: 'Genesis Post',
          description: 'The very first post minted on YourZ - a milestone in decentralized content creation',
          imageUrl: 'https://picsum.photos/seed/genesis/600/400',
          price: '0.01',
          royaltyBps: 1000, // 10%
          creator: {
            address: '0x1234567890123456789012345678901234567890',
            name: 'Alex Thompson',
            avatar: 'https://picsum.photos/seed/alex/100/100',
          },
          owner: {
            address: '0x4567890123456789012345678901234567890123',
            name: 'CryptoCollector',
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 100,
          remaining: 87,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '2',
          tokenId: '2',
          contractAddress: '0x2345678901234567890123456789012345678901',
          title: 'The Future of Web3',
          description: 'An in-depth analysis of decentralized technologies and their impact on the internet',
          imageUrl: 'https://picsum.photos/seed/web3/600/400',
          price: '0.025',
          royaltyBps: 800, // 8%
          creator: {
            address: '0x2345678901234567890123456789012345678901',
            name: 'Sarah Chen',
            avatar: 'https://picsum.photos/seed/sarah/100/100',
          },
          owner: {
            address: '0x5678901234567890123456789012345678901234',
            name: 'Web3Enthusiast',
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 50,
          remaining: 23,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '3',
          tokenId: '3',
          contractAddress: '0x3456789012345678901234567890123456789012',
          title: 'DeFi Revolution',
          description: 'Exploring the revolutionary changes in decentralized finance and yield farming',
          imageUrl: 'https://picsum.photos/seed/defi/600/400',
          price: '0.015',
          royaltyBps: 1200, // 12%
          creator: {
            address: '0x3456789012345678901234567890123456789012',
            name: 'Marcus Rodriguez',
            avatar: 'https://picsum.photos/seed/marcus/100/100',
          },
          owner: {
            address: '0x6789012345678901234567890123456789012345',
            name: 'DeFiWhale',
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 75,
          remaining: 45,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '4',
          tokenId: '4',
          contractAddress: '0x4567890123456789012345678901234567890123',
          title: 'NFT Art Collection',
          description: 'A curated collection of digital art exploring the intersection of technology and creativity',
          imageUrl: 'https://picsum.photos/seed/art/600/400',
          price: '0.05',
          royaltyBps: 1500, // 15%
          creator: {
            address: '0x4567890123456789012345678901234567890123',
            name: 'Emma Wilson',
            avatar: 'https://picsum.photos/seed/emma/100/100',
          },
          owner: {
            address: '0x7890123456789012345678901234567890123456',
            name: 'ArtCollector',
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 25,
          remaining: 8,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '5',
          tokenId: '5',
          contractAddress: '0x5678901234567890123456789012345678901234',
          title: 'Blockchain Gaming Guide',
          description: 'Complete guide to blockchain gaming, play-to-earn models, and the future of gaming',
          imageUrl: 'https://picsum.photos/seed/gaming/600/400',
          price: '0.03',
          royaltyBps: 900, // 9%
          creator: {
            address: '0x5678901234567890123456789012345678901234',
            name: 'David Kim',
            avatar: 'https://picsum.photos/seed/david/100/100',
          },
          owner: {
            address: '0x8901234567890123456789012345678901234567',
            name: 'GamerPro',
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 60,
          remaining: 34,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '6',
          tokenId: '6',
          contractAddress: '0x6789012345678901234567890123456789012345',
          title: 'Metaverse Architecture',
          description: 'Designing virtual worlds: architecture principles for the metaverse',
          imageUrl: 'https://picsum.photos/seed/metaverse/600/400',
          price: '0.04',
          royaltyBps: 1100, // 11%
          creator: {
            address: '0x6789012345678901234567890123456789012345',
            name: 'Lisa Park',
            avatar: 'https://picsum.photos/seed/lisa/100/100',
          },
          owner: {
            address: '0x9012345678901234567890123456789012345678',
            name: 'MetaverseExplorer',
          },
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 40,
          remaining: 12,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '7',
          tokenId: '7',
          contractAddress: '0x7890123456789012345678901234567890123456',
          title: 'DAO Governance Models',
          description: 'Understanding different DAO governance structures and voting mechanisms',
          imageUrl: 'https://picsum.photos/seed/dao/600/400',
          price: '0.02',
          royaltyBps: 700, // 7%
          creator: {
            address: '0x7890123456789012345678901234567890123456',
            name: 'James Miller',
            avatar: 'https://picsum.photos/seed/james/100/100',
          },
          owner: {
            address: '0x0123456789012345678901234567890123456789',
            name: 'DAOVoter',
          },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 80,
          remaining: 56,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '8',
          tokenId: '8',
          contractAddress: '0x8901234567890123456789012345678901234567',
          title: 'Layer 2 Scaling Solutions',
          description: 'Comprehensive overview of Layer 2 scaling solutions and their impact on Ethereum',
          imageUrl: 'https://picsum.photos/seed/layer2/600/400',
          price: '0.035',
          royaltyBps: 950, // 9.5%
          creator: {
            address: '0x8901234567890123456789012345678901234567',
            name: 'Rachel Green',
            avatar: 'https://picsum.photos/seed/rachel/100/100',
          },
          owner: {
            address: '0x1234567890123456789012345678901234567890',
            name: 'EthereumMaxi',
          },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 35,
          remaining: 18,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '9',
          tokenId: '9',
          contractAddress: '0x9012345678901234567890123456789012345678',
          title: 'Smart Contract Security',
          description: 'Best practices for smart contract development and security auditing',
          imageUrl: 'https://picsum.photos/seed/security/600/400',
          price: '0.045',
          royaltyBps: 1300, // 13%
          creator: {
            address: '0x9012345678901234567890123456789012345678',
            name: 'Michael Brown',
            avatar: 'https://picsum.photos/seed/michael/100/100',
          },
          owner: {
            address: '0x2345678901234567890123456789012345678901',
            name: 'SecurityExpert',
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 30,
          remaining: 7,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '10',
          tokenId: '10',
          contractAddress: '0x0123456789012345678901234567890123456789',
          title: 'Cross-Chain Interoperability',
          description: 'Exploring bridges, cross-chain protocols, and the future of multi-chain ecosystems',
          imageUrl: 'https://picsum.photos/seed/crosschain/600/400',
          price: '0.055',
          royaltyBps: 1400, // 14%
          creator: {
            address: '0x0123456789012345678901234567890123456789',
            name: 'Sophie Anderson',
            avatar: 'https://picsum.photos/seed/sophie/100/100',
          },
          owner: {
            address: '0x3456789012345678901234567890123456789012',
            name: 'ChainHopper',
          },
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 20,
          remaining: 3,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '11',
          tokenId: '11',
          contractAddress: '0x1234567890123456789012345678901234567890',
          title: 'Tokenomics Deep Dive',
          description: 'Understanding token economics, vesting schedules, and token utility design',
          imageUrl: 'https://picsum.photos/seed/tokenomics/600/400',
          price: '0.025',
          royaltyBps: 850, // 8.5%
          creator: {
            address: '0x1234567890123456789012345678901234567890',
            name: 'Chris Taylor',
            avatar: 'https://picsum.photos/seed/chris/100/100',
          },
          owner: {
            address: '0x4567890123456789012345678901234567890123',
            name: 'TokenAnalyst',
          },
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 45,
          remaining: 22,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        },
        {
          id: '12',
          tokenId: '12',
          contractAddress: '0x2345678901234567890123456789012345678901',
          title: 'Zero-Knowledge Proofs',
          description: 'Privacy-preserving technologies and their applications in blockchain',
          imageUrl: 'https://picsum.photos/seed/zkp/600/400',
          price: '0.06',
          royaltyBps: 1600, // 16%
          creator: {
            address: '0x2345678901234567890123456789012345678901',
            name: 'Nina Patel',
            avatar: 'https://picsum.photos/seed/nina/100/100',
          },
          owner: {
            address: '0x5678901234567890123456789012345678901234',
            name: 'PrivacyAdvocate',
          },
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          supply: 15,
          remaining: 2,
          isListed: true,
          collection: {
            id: 'yourz-posts',
            name: 'YourZ Posts',
            description: 'Collection of minted posts from YourZ platform',
            imageUrl: 'https://picsum.photos/seed/collection/200/200',
          },
        }
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
                  price: '0.01',
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