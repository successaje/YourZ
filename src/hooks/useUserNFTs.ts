import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface NFT {
  id: string
  post_id: string
  contract_address: string
  token_id: string
  name: string
  description: string
  image_uri: string
  metadata_uri: string
  price: number
  max_supply: number
  current_supply: number
  creator_id: string
  creator_address: string
  status: string
  minted_at: string
  created_at: string
  updated_at: string
  posts?: {
    title: string
    content: string
    created_at: string
  }
}

interface UseUserNFTsReturn {
  nfts: NFT[]
  loading: boolean
  error: string | null
}

export function useUserNFTs(userAddress?: string): UseUserNFTsReturn {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userAddress) {
      setNfts([])
      return
    }

    const fetchNFTs = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from('post_nfts')
          .select(`
            *,
            posts (
              title,
              content,
              created_at
            )
          `)
          .eq('creator_address', userAddress.toLowerCase())
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setNfts(data || [])
      } catch (err) {
        console.error('Error fetching user NFTs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs')
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [userAddress])

  return { nfts, loading, error }
} 