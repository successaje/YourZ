export interface Author {
  address: string
  name: string
  avatar?: string
}

export interface NftMetadata {
  tokenId?: string
  contractAddress?: string
  txHash?: string
  metadataHash?: string
  contentHash?: string
  imageHash?: string
  price?: string
  royaltyBps?: string | number
  supply?: number
}

export interface CoinMetadata {
  symbol: string
  mintFee?: string
  contractAddress?: string
  txHash?: string
  image?: File
}

export interface PostMetadata {
  title?: string
  content?: string
  mintPrice?: number
  royaltyBps?: number
  coverImage?: string | null
  createdAt?: string | Date
  author?: {
    address: string
    name: string
    avatar?: string
  }
  tags?: string[]
  nftMetadata?: NftMetadata
  coinMetadata?: CoinMetadata
  [key: string]: any // Allow additional properties
}

export interface Post {
  // Core post fields
  id: string
  title: string
  content: string
  excerpt?: string
  
  // Media
  coverImage?: string | null
  cover_image?: string | null // Alias for coverImage
  
  // Author information
  author: {
    address: string
    name: string
    avatar?: string
  }
  author_id?: string
  author_name?: string  // For backward compatibility
  coAuthors?: Array<{
    address: string
    name: string
    avatar?: string
  }>
  
  // Timestamps
  created_at?: string | Date
  updated_at?: string | Date
  
  // NFT related fields
  is_nft?: boolean
  price?: string
  minted?: number
  totalSupply?: number
  royaltyBps?: number
  tokenId?: string
  contractAddress?: string
  ipfsHash?: string
  
  // Post metadata
  tags?: string[]
  status?: 'draft' | 'published' | 'minted'
  
  // Full metadata object (for posts with rich metadata)
  metadata?: PostMetadata

  // Allow additional properties
  [key: string]: any
}