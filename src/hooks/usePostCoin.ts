import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { deployZoraCoin } from '@/utils/zora';
import { createPostCoin } from '@/services/postCoinService';
import { useToast } from '@/components/ui/use-toast';

export const usePostCoin = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCoinForPost = async (post: {
    id: string;
    title: string;
    content: string;
    author_id: string;
  }) => {
    if (!address) {
      setError('Please connect your wallet');
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Generate a symbol from the post title (first 3-5 uppercase letters)
      const symbol = post.title
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .substring(0, 5) || 'POST';

      // Prepare metadata and upload to IPFS
      const { uploadFileToIPFS } = await import('@/lib/ipfs');
      
      // For now, use a default placeholder image since this hook doesn't have access to user-uploaded images
      // In the future, this could be enhanced to accept an image parameter
      const metadata = {
        name: `YourZ: ${post.title.substring(0, 32)}`,
        description: `Coin for post: ${post.title} on YourZ`,
        external_url: typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '',
        image: 'ipfs://bafybeihj5z3b2g4d4q4z4y5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q', // Default placeholder image
      };
      const { uploadToIPFS } = await import('@/lib/ipfs');
      const metadataHash = await uploadToIPFS(metadata);
      const uri = `ipfs://${metadataHash}`;

      // Deploy the Zora coin with new signature
      const contractAddress = await deployZoraCoin({
        name: metadata.name,
        symbol: symbol,
        uri,
        payoutRecipient: address,
        mintFeeRecipient: address,
        walletClient,
        publicClient,
        account: address,
        // Optionally: platformReferrer, chainId, currency, mintFee
      });

      // Save to Supabase
      const postCoin = await createPostCoin({
        postId: post.id,
        contractAddress,
        name: metadata.name,
        symbol,
        totalSupply: 1000000,
        creatorId: post.author_id,
      });

      toast({
        title: 'Coin created successfully!',
        description: `Your post coin ${symbol} has been created.`,
      });

      return postCoin;
    } catch (err) {
      console.error('Error creating post coin:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create coin';
      setError(errorMessage);
      toast({
        title: 'Error creating coin',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createCoinForPost,
    isCreating,
    error,
  };
};

export default usePostCoin;
