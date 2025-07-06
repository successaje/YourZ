import { useState } from 'react';
import { useAccount, usePublicClient, useWalletClient, useConfig } from 'wagmi';
import { getAddress, parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import { uploadToIPFS, uploadFileToIPFS } from '@/lib/ipfs';
import { NFTMintResult } from '@/types/nft';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';

// Zora 1155 contract address - DEPRECATED: Using individual contracts per post now
// const ZORA_1155_CONTRACT = '0xD289FDef439d54eCb3a16d36A4b6B123A79DF9Bd' as `0x${string}`;

export const useZoraMinter = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const config = useConfig();
  const [isMinting, setIsMinting] = useState(false);
  
  // This would be your deployed contract address - DEPRECATED: Using individual contracts per post now
  // const contractAddress =  '0xD289FDef439d54eCb3a16d36A4b6B123A79DF9Bd';//process.env.NEXT_PUBLIC_ZORA_CONTRACT_ADDRESS || '0x...';
  
  // Use token ID 1 for existing contracts (most Zora contracts are deployed with token ID 1)
  const getNextTokenId = async (contractAddress: `0x${string}`): Promise<bigint> => {
    // For existing contracts, always use token ID 1
    // Most Zora 1155 contracts are deployed with token ID 1 already created
    console.log(`Using token ID 1 for existing contract: ${contractAddress}`);
    return 1n;
  };
  
  // DEPRECATED: This function uses the old shared contract. Using individual contracts per post now.
  // const mintNFT = async ({
  //   title,
  //   description,
  //   content,
  //   coverImage,
  //   price,
  //   royaltyBps,
  //   onSuccess,
  // }: {
  //   title: string;
  //   description: string;
  //   content: string;
  //   coverImage: File | null;
  //   price: string;
  //   royaltyBps: string;
  //   onSuccess?: (tokenId: string, tokenAddress: string) => void;
  // }): Promise<NFTMintResult> => {
  //   // ... entire function body commented out ...
  // };
  
  // DEPRECATED: mintNFT function is commented out - using individual contracts per post now
  // return { mintNFT, isMinting };
  return { isMinting };
};
