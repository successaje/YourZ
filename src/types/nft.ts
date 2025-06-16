export interface NFTFormData {
  price: string;
  royaltyBps: string;
  coverImage: File | null;
  coverImagePreview: string;
  description: string;
}

export interface NFTMintResult {
  tokenId: string;
  tokenAddress: string;
  txHash: string;
  price: string;
  royaltyBps: string;
  metadataHash: string;
  contentHash: string;
  imageHash: string;
}

export interface NFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  royaltyBps: number;
  creator: {
    address: string;
    name?: string;
    avatar?: string;
  };
  owner: {
    address: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
  supply: number;
  remaining: number;
  isListed: boolean;
  collection?: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  };
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  metadata?: Record<string, any>;
}
