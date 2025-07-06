import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient, useChainId, useWriteContract } from 'wagmi'
import { create1155, createCollectorClient } from '@zoralabs/protocol-sdk'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { parseEther } from 'viem'
import { baseSepoliaConfig } from '@/lib/networks'

interface MintNFTParams {
  contractAddress: string
  tokenId: string
  price: string
  maxSupply: number
  currentSupply: number
  postTitle: string
  postId: string
  prepareMint?: (params: {
    quantityToMint: bigint;
    minterAccount: `0x${string}`;
  }) => Promise<{ parameters: any }>;
}

interface MintResult {
  success: boolean
  transactionHash?: string
  error?: string
}

// ERC-1155 ABI for direct minting with data parameter
const ERC1155_MINT_WITH_DATA_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

// ERC-1155 ABI for direct minting without data parameter
const ERC1155_MINT_WITHOUT_DATA_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

export function useNFTMinting() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [isMinting, setIsMinting] = useState(false)
  const chainId = useChainId()

  const mintNFT = async ({
    contractAddress,
    tokenId,
    price,
    maxSupply,
    currentSupply,
    postTitle,
    postId,
    prepareMint
  }: MintNFTParams): Promise<MintResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    if (currentSupply >= maxSupply) {
      return { success: false, error: 'Maximum supply reached' }
    }

    if (!publicClient || !walletClient) {
      return { success: false, error: 'Blockchain clients not available' }
    }

    // Check if user is connected to the correct network (Base Sepolia)
    const currentChainId = await publicClient.getChainId()
    if (currentChainId !== baseSepoliaConfig.id) {
      return { 
        success: false, 
        error: `Please switch to ${baseSepoliaConfig.name} network. Current network: ${currentChainId}` 
      }
    }

    setIsMinting(true)

    try {
      console.log('Starting minting process:', {
        contractAddress,
        tokenId,
        price,
        maxSupply,
        currentSupply,
        postTitle,
        postId,
        hasPrepareMint: !!prepareMint
      })

      console.log('Chain ID:', chainId)
      console.log('Public client chain:', publicClient.chain)

      // Try prepareMint function first (if available)
      if (prepareMint) {
        try {
          console.log('Attempting mint with prepareMint function...')
          
          const { parameters } = await prepareMint({
            quantityToMint: 1n,
            minterAccount: address as `0x${string}`,
          })

          console.log('PrepareMint parameters:', parameters)

          // Execute the mint transaction
          const hash = await writeContractAsync(parameters)

          console.log('PrepareMint transaction sent with hash:', hash)

          // Wait for transaction confirmation
          const receipt = await publicClient.waitForTransactionReceipt({ hash })

          if (receipt.status === 'success') {
            console.log('PrepareMint transaction confirmed:', receipt)
            
            // Update the database with the new supply
            const { error: updateError } = await supabase
              .from('post_nfts')
              .update({ 
                current_supply: currentSupply + 1,
                updated_at: new Date().toISOString()
              })
              .eq('post_id', postId)

            if (updateError) {
              console.error('Error updating NFT supply in database:', updateError)
              // Don't fail the mint if database update fails
            }

            toast.success('NFT minted successfully!')
            
            return {
              success: true,
              transactionHash: hash
            }
          } else {
            throw new Error('PrepareMint transaction failed')
          }

        } catch (prepareMintError) {
          console.log('PrepareMint failed, trying direct contract interaction:', prepareMintError)
        }
      }

      // Try direct contract interaction (bypasses Zora SDK sales configuration)
      try {
        console.log('Attempting direct contract mint...')
        
        // Try the mint function with data parameter first
        let mintParams = {
          address: contractAddress as `0x${string}`,
          abi: ERC1155_MINT_WITH_DATA_ABI,
          functionName: 'mint' as const,
          args: [
            address as `0x${string}`, // to
            BigInt(tokenId), // tokenId
            1n, // amount
            '0x' // data (empty bytes)
          ],
          // Include value if there's a price
          ...(price && parseFloat(price) > 0 && {
            value: parseEther(price)
          })
        }

        console.log('Direct mint parameters:', mintParams)

        // Execute the mint transaction directly
        const hash = await writeContractAsync(mintParams)

        console.log('Direct mint transaction sent with hash:', hash)

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash })

        if (receipt.status === 'success') {
          console.log('Direct mint transaction confirmed:', receipt)
          
          // Update the database with the new supply
          const { error: updateError } = await supabase
            .from('post_nfts')
            .update({ 
              current_supply: currentSupply + 1,
              updated_at: new Date().toISOString()
            })
            .eq('post_id', postId)

          if (updateError) {
            console.error('Error updating NFT supply in database:', updateError)
            // Don't fail the mint if database update fails
          }

          toast.success('NFT minted successfully!')
          
          return {
            success: true,
            transactionHash: hash
          }
        } else {
          throw new Error('Direct mint transaction failed')
        }

      } catch (directMintError) {
        console.log('Direct mint with data parameter failed, trying without data:', directMintError)
        
        try {
          // Try the mint function without data parameter
          const mintParams = {
            address: contractAddress as `0x${string}`,
            abi: ERC1155_MINT_WITHOUT_DATA_ABI,
            functionName: 'mint' as const,
            args: [
              address as `0x${string}`, // to
              BigInt(tokenId), // tokenId
              1n, // amount
            ],
            // Include value if there's a price
            ...(price && parseFloat(price) > 0 && {
              value: parseEther(price)
            })
          }

          console.log('Direct mint parameters (without data):', mintParams)

          // Execute the mint transaction directly
          const hash = await writeContractAsync(mintParams)

          console.log('Direct mint transaction sent with hash:', hash)

          // Wait for transaction confirmation
          const receipt = await publicClient.waitForTransactionReceipt({ hash })

          if (receipt.status === 'success') {
            console.log('Direct mint transaction confirmed:', receipt)
            
            // Update the database with the new supply
            const { error: updateError } = await supabase
              .from('post_nfts')
              .update({ 
                current_supply: currentSupply + 1,
                updated_at: new Date().toISOString()
              })
              .eq('post_id', postId)

            if (updateError) {
              console.error('Error updating NFT supply in database:', updateError)
              // Don't fail the mint if database update fails
            }

            toast.success('NFT minted successfully!')
            
            return {
              success: true,
              transactionHash: hash
            }
          } else {
            throw new Error('Direct mint transaction failed')
          }

        } catch (directMintError2) {
          console.log('Direct mint without data also failed, trying Zora SDK approach:', directMintError2)
          
          // Fallback to Zora SDK approach (in case direct mint doesn't work)
          const collectorClient = createCollectorClient({
            chainId: baseSepoliaConfig.id,
            publicClient,
          })

          const mintParams = {
            tokenContract: contractAddress as `0x${string}`,
            mintType: '1155' as const,
            tokenId: BigInt(tokenId),
            quantityToMint: 1,
            minterAccount: address as `0x${string}`,
            // If there's a price, include it
            ...(price && parseFloat(price) > 0 && {
              value: parseEther(price)
            })
          }

          console.log('Zora SDK mint parameters:', mintParams)

          // Get mint parameters from collector client
          const { parameters } = await collectorClient.mint(mintParams)

          console.log('Zora SDK mint transaction parameters:', parameters)

          // Execute the mint transaction
          const hash = await writeContractAsync(parameters)

          console.log('Zora SDK mint transaction sent with hash:', hash)

          // Wait for transaction confirmation
          const receipt = await publicClient.waitForTransactionReceipt({ hash })

          if (receipt.status === 'success') {
            console.log('Zora SDK mint transaction confirmed:', receipt)
            
            // Update the database with the new supply
            const { error: updateError } = await supabase
              .from('post_nfts')
              .update({ 
                current_supply: currentSupply + 1,
                updated_at: new Date().toISOString()
              })
              .eq('post_id', postId)

            if (updateError) {
              console.error('Error updating NFT supply in database:', updateError)
              // Don't fail the mint if database update fails
            }

            toast.success('NFT minted successfully!')
            
            return {
              success: true,
              transactionHash: hash
            }
          } else {
            throw new Error('Zora SDK mint transaction failed')
          }
        }
      }

    } catch (error) {
      console.error('Error minting NFT:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to mint NFT'
      
      toast.error(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsMinting(false)
    }
  }

  const getNFTData = async (postId: string) => {
    try {
      const { data: nftData, error } = await supabase
        .from('post_nfts')
        .select('*')
        .eq('post_id', postId)
        .single()

      if (error) {
        console.error('Error fetching NFT data:', error)
        return null
      }

      return nftData
    } catch (error) {
      console.error('Error fetching NFT data:', error)
      return null
    }
  }

  return {
    mintNFT,
    getNFTData,
    isMinting
  }
} 