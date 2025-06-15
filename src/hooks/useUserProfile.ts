import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface UserStats {
  posts_count: number
  collections_count: number
  nfts_count: number
  total_likes: number
}

interface Post {
  id: string
  title: string
  content: string
  metadata: any
  status: string
  is_nft: boolean
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  address: string
  username: string
  ipfs_hash: string
  created_at: string
  updated_at: string
  bio: string | null
  level: number
  social_links: Record<string, string>
  email: string | null
  user_stats: UserStats
  posts: Post[]
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
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch profile')
        }

        const data = await response.json()
        console.log('Profile data received:', data)
        setProfile(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [address])

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!address) return

    try {
      const response = await fetch('/api/users/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, ...data })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      toast.success('Profile updated successfully')
      return updatedProfile
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile')
      toast.error(error.message)
      throw error
    }
  }

  const getPosts = () => {
    return profile?.posts || []
  }

  const getStats = () => {
    return profile?.user_stats || {
      posts_count: 0,
      collections_count: 0,
      nfts_count: 0,
      total_likes: 0
    }
  }

  return {
    profile,
    setProfile,
    isLoading,
    error,
    updateProfile,
    getPosts,
    getStats
  }
} 