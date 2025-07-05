'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { useZora } from '@/hooks/useZora';
import { NFT } from '@/types/nft';
import Image from 'next/image';
import Link from 'next/link';
import { formatEther } from 'viem';

export default function NFTPage() {
  const { contractAddress, tokenId } = useParams<{ contractAddress: string; tokenId: string }>();
  const { address, isConnected } = useAccount();
  const { fetchNFTDetails } = useZora();
  const router = useRouter();
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const loadNFT = async () => {
      if (!contractAddress || !tokenId) return;
      
      try {
        setIsLoading(true);
        const nftData = await fetchNFTDetails(
          Array.isArray(contractAddress) ? contractAddress[0] : contractAddress,
          Array.isArray(tokenId) ? tokenId[0] : tokenId
        );
        
        if (nftData) {
          setNft(nftData);
          setIsOwner(address?.toLowerCase() === nftData.owner.address.toLowerCase());
        }
      } catch (error) {
        console.error('Failed to load NFT:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadNFT();
    }
  }, [contractAddress, tokenId, address, isConnected, fetchNFTDetails]);

  const handleBuy = async () => {
    if (!nft) return;
    
    try {
      // TODO: Implement buy logic using Zora SDK
      console.log('Initiating purchase for NFT:', nft.id);
      // This would typically open a transaction modal or redirect to checkout
    } catch (error) {
      console.error('Failed to initiate purchase:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your wallet to view this NFT.
          </p>
          <w3m-connect-button />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">NFT Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The requested NFT could not be found or may have been removed.
          </p>
          <button
            onClick={() => router.push('/marketplace')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const priceInEth = nft.price || '0';
  const royaltyPercentage = (nft.royaltyBps / 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* NFT Image */}
          <div className="mb-8 lg:mb-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              {nft.imageUrl ? (
                <div className="relative aspect-square w-full">
                  <Image
                    src={nft.imageUrl}
                    alt={nft.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* NFT Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {/* Collection */}
            {nft.collection && (
              <div className="mb-4">
                <Link 
                  href={`/collection/${nft.collection.id}`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  {nft.collection.name}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {nft.title}
            </h1>

            {/* Creator */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {nft.creator.avatar ? (
                  <Image
                    src={nft.creator.avatar}
                    alt={nft.creator.name || 'Creator'}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">
                    {nft.creator.name?.[0] || nft.creator.address.slice(2, 4).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creator</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {nft.creator.name || `${nft.creator.address.slice(0, 6)}...${nft.creator.address.slice(-4)}`}
                </p>
              </div>
            </div>

            {/* Description */}
            {nft.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {nft.description}
                </p>
              </div>
            )}

            {/* Price and Action Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {priceInEth} ETH
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Creator Royalty: {royaltyPercentage}%
                  </p>
                </div>
                
                {isOwner ? (
                  <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-4 py-2 rounded-lg">
                    You own this NFT
                  </div>
                ) : (
                  <button
                    onClick={handleBuy}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buy Now
                  </button>
                )}
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Token ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{nft.tokenId}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Contract</p>
                  <p className="font-mono text-gray-900 dark:text-white text-xs truncate">
                    {nft.contractAddress}
                  </p>
                </div>
                {nft.supply > 1 && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Supply</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {nft.remaining} of {nft.supply} remaining
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
