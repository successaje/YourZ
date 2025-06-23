import { useState } from 'react';
import { useAccount } from 'wagmi';
import { mintNFT } from '@/utils/zora';
import { toast } from 'react-hot-toast';

interface MintParams {
  tokenURI: string;
  quantity?: number;
  price?: string;
  recipient: `0x${string}`;
  contractAddress?: `0x${string}`;
}

export function useZoraMint() {
  const { address } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  const mintNFTWithConfig = async ({
    tokenURI,
    quantity = 1,
    price = '0.000777',
    recipient,
    contractAddress
  }: MintParams) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsMinting(true);
    setMintError(null);

    try {
      const result = await mintNFT({
        tokenURI,
        quantity,
        price,
        recipient,
        contractAddress
      });

      if (result.success) {
        toast.success('NFT minted successfully!');
      } else {
        toast.error(result.error || 'Failed to mint NFT');
        setMintError(result.error || 'Unknown error occurred');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mint NFT';
      toast.error(errorMessage);
      setMintError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsMinting(false);
    }
  };

  // Alias for backward compatibility
  const mint = async (tokenURI: string, quantity = 1, price = '0.000777') => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }
    return mintNFTWithConfig({ tokenURI, quantity, price, recipient: address });
  };

  return {
    mint,
    mintNFT: mintNFTWithConfig,
    isMinting,
    mintError,
    walletAddress: address
  };
}
