import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface UserStats {
  posts_count: number
  collections_count: number
  nfts_count: number
  total_likes: number
}

interface SocialLinks {
  twitter?: string
  github?: string
  discord?: string
  medium?: string
  mirror?: string
  telegram?: string
  instagram?: string
  website?: string
}

interface UserProfile {
  id: string
  address: string
  username: string
  email: string
  ipfs_hash: string
  created_at: string
  bio: string
  level: number
  social_links: SocialLinks
  followers_count: number
  following_count: number
  stats: UserStats
}

export function useUserProfile(address?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) {
        setIsLoading(false)
        return
      }

      try {
        console.log('Fetching profile for address:', address)
        const response = await fetch(`/api/users/profile?address=${address}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            // User not found, might need migration
            setError(new Error('User not found. Please migrate your data.'))
          } else {
            throw new Error('Failed to fetch profile')
          }
          return
        }

        const data = await response.json()
        console.log('Profile data received:', data)
        setProfile(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [address])

  return { profile, setProfile, isLoading, error }
} 