import { useState } from 'react';
import { useAccount, usePublicClient, useWalletClient, useConfig } from 'wagmi';
import { getAddress, parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import { uploadToIPFS, uploadFileToIPFS } from '@/lib/ipfs';
import { NFTMintResult } from '@/types/nft';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';

// Zora 1155 contract address
const ZORA_1155_CONTRACT = '0xD289FDef439d54eCb3a16d36A4b6B123A79DF9Bd' as `0x${string}`;

export const useZoraMinter = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const config = useConfig();
  const [isMinting, setIsMinting] = useState(false);
  
  // This would be your deployed contract address
  const contractAddress =  '0xD289FDef439d54eCb3a16d36A4b6B123A79DF9Bd';//process.env.NEXT_PUBLIC_ZORA_CONTRACT_ADDRESS || '0x...';
  
  // Use token ID 1 for existing contracts (most Zora contracts are deployed with token ID 1)
  const getNextTokenId = async (contractAddress: `0x${string}`): Promise<bigint> => {
    // For existing contracts, always use token ID 1
    // Most Zora 1155 contracts are deployed with token ID 1 already created
    console.log(`Using token ID 1 for existing contract: ${contractAddress}`);
    return 1n;
  };
  
  const mintNFT = async ({
    title,
    description,
    content,
    coverImage,
    price,
    royaltyBps,
    onSuccess,
  }: {
    title: string;
    description: string;
    content: string;
    coverImage: File | null;
    price: string;
    royaltyBps: string;
    onSuccess?: (tokenId: string, tokenAddress: string) => void;
  }): Promise<NFTMintResult> => {
    if (!address) {
      toast.error('Please connect your wallet');
      throw new Error('No connected wallet');
    }
    
    setIsMinting(true);
    
    try {
      // 1. Upload content to IPFS
      console.log('Uploading content to IPFS...');
      const contentData = {
        content,
        metadata: {
          title,
          description,
          type: 'post',
          timestamp: new Date().toISOString()
        }
      };
      const contentHash = await uploadToIPFS(contentData);
      console.log('Content uploaded to IPFS:', contentHash);
      
      // 2. Upload cover image to IPFS if it exists
      let imageHash = '';
      if (coverImage) {
        console.log('Uploading cover image to IPFS...');
        try {
          imageHash = await uploadFileToIPFS(coverImage);
          console.log('Cover image uploaded to IPFS:', imageHash);
        } catch (error) {
          console.error('Error uploading cover image:', error);
          // Don't fail the whole process if image upload fails
          toast.error('Failed to upload cover image, but continuing without it');
        }
      }
      
      // 3. Create metadata
      const metadata = {
        name: title,
        description,
        image: imageHash ? `ipfs://${imageHash}` : null,
        content: `ipfs://${contentHash}`,
        external_url: `https://yourz.xyz/posts/${contentHash}`,
        attributes: [
          {
            trait_type: 'Creator',
            value: address,
          },
          {
            trait_type: 'Type',
            value: 'Post'
          }
        ],
        properties: {
          created_at: new Date().toISOString(),
          content_type: 'post',
          original_author: address,
          original_content_hash: contentHash
        }
      };
      
      // 4. Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataHash = await uploadToIPFS(metadata).catch((error) => {
        console.error('Error uploading metadata to IPFS:', error);
        throw new Error('Failed to upload NFT metadata. Please try again.');
      });
      console.log('Metadata uploaded to IPFS:', metadataHash);
      
      // Check wallet connection
      if (!publicClient || !config) {
        throw new Error('Wallet not connected');
      }

      // Get next token ID from contract
      console.log('Getting next token ID from contract...');
      const tokenId = await getNextTokenId(ZORA_1155_CONTRACT);
      console.log('Next token ID:', tokenId.toString());
      
      // 5. Create the token first (if it doesn't exist)
      console.log('Creating token on contract...');
      try {
        // For Zora 1155 contracts, we might need to create the token first
        // But let's try minting directly first, and only create if needed
        console.log('Attempting to mint directly without creating token first...');
      } catch (createError: any) {
        console.error('Error in token creation step:', createError);
        // Continue with minting anyway
      }
      
      // 6. Use direct contract call for minting (bypass Zora SDK for Base Sepolia)
      console.log('Using direct contract call for minting...');
      
      // Define the mint function ABI for ERC-1155
      const mintAbi = [
        {
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
            { name: 'data', type: 'bytes' }
          ],
          name: 'mint',
          outputs: [],
          stateMutability: 'payable',
          type: 'function'
        }
      ] as const;
      
      // 7. Execute the mint transaction using direct contract call
      console.log('Executing mint transaction...');
      const txHash = await writeContract(config, {
        address: ZORA_1155_CONTRACT,
        abi: mintAbi,
        functionName: 'mint',
        args: [
          address as `0x${string}`,
          tokenId,
          1n, // quantity
          '0x' // empty data
        ],
        value: parseEther(price || '0.000777'), // mint fee
      });
      console.log('Transaction hash:', txHash);
      
      // 8. Wait for the transaction to be mined
      const receipt = await waitForTransactionReceipt(config, { 
        hash: txHash,
        confirmations: 2,
        timeout: 120_000, // 2 minutes timeout
      });
      
      console.log('Transaction receipt:', receipt);
      
      if (receipt.status !== 'success') {
        throw new Error('Transaction failed');
      }
      
      // Call the success callback with the actual values
      onSuccess?.(tokenId.toString(), ZORA_1155_CONTRACT);

      const result: NFTMintResult = {
        tokenId: tokenId.toString(),
        tokenAddress: getAddress(ZORA_1155_CONTRACT),
        txHash,
        price,
        royaltyBps,
        metadataHash,
        contentHash,
        imageHash,
      };

      return result;
    } catch (error: unknown) {
      console.error('Error minting NFT:', error);
      
      // More specific error messages based on the error type
      let errorMessage = 'Failed to mint NFT. Please try again.';
      
      const errorMessageStr = error instanceof Error ? error.message : String(error);
      
      if (errorMessageStr.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas and minting fee';
      } else if (errorMessageStr.includes('reverted')) {
        errorMessage = 'Transaction reverted. The contract may not support this operation.';
      } else if (errorMessageStr.includes('gas required exceeds allowance')) {
        errorMessage = 'Insufficient gas. Please try with more ETH for gas.';
      } else if (errorMessageStr.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (errorMessageStr.includes('Cannot find token')) {
        errorMessage = 'Token not found on contract. Please try again.';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };
  
  return { mintNFT, isMinting };
};
