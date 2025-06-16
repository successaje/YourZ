export interface Post {
  id: string
  title: string
  content: string
  author: string
  price: string
  timestamp: string
  is_nft: boolean
  status: 'draft' | 'published' | 'minted'
  metadata?: {
    title?: string
    content?: string
    author?: {
      name: string
      avatar?: string
      wallet: string
    }
    createdAt?: string
    ipfsHash?: string
    ipfsUrl?: string
    nftMetadata?: {
      hash?: string
      url?: string
      parameters?: any
    }
    [key: string]: any
  }
  author_id?: string
  author_name?: string
  author_avatar?: string
  wallet_address: string
  cover_image?: string
  created_at?: string
  updated_at?: string
  token_id?: string
  contract_address?: string
  ipfs_hash?: string
  mint_price?: string
  royalty_bps?: string
}

export interface UserProfile {
  id: string;
  address: string;
  username: string;
  ipfs_hash: string;
  created_at: string;
  updated_at: string;
  bio: string | null;
  level: number;
  social_links: Record<string, string>;
  email: string | null;
  user_stats: {
    posts_count: number;
    collections_count: number;
    nfts_count: number;
    total_likes: number;
  };
  posts: Post[];
}

export interface Collection {
  id: string
  name: string
  description: string
  posts: Post[]
  owner: string
  createdAt: string
}

export interface User {
  address: string
  posts: Post[]
  collections: Collection[]
  balance: string
} 