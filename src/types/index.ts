export interface Post {
  id: string
  title: string
  content: string
  author: string
  price: string
  timestamp: string
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