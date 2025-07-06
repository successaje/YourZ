import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface NFT {
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

export function useAllNFTs() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNFTs() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('post_nfts')
          .select(`
            *,
            posts (
              title,
              content,
              created_at
            )
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching NFTs:', error)
          setError(error.message)
          return
        }

        setNfts(data || [])
      } catch (err) {
        console.error('Error fetching NFTs:', err)
        setError('Failed to fetch NFTs')
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [])

  return { nfts, loading, error }
} 