export interface Author {
  address: string
  name: string
  avatar?: string
}

export interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  coverImage?: string
  author: Author
  coAuthors?: Author[]
  createdAt: Date
  updatedAt: Date
  price: string
  minted: number
  totalSupply: number
  royaltyBps: number
  tokenId?: string
  contractAddress?: string
  ipfsHash?: string
  tags: string[]
  status: 'draft' | 'published' | 'minted'
}

export interface PostMetadata {
  title: string
  description: string
  image?: string
  content: string
  author: Author
  coAuthors?: Author[]
  createdAt: Date
  tags: string[]
} 