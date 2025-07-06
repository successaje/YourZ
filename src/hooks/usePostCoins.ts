import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface PostCoin {
  id: string
  post_id: string
  contract_address: string
  name: string
  symbol: string
  total_supply: number
  creator_id: string
  metadata_uri?: string
  created_at: string
  updated_at: string
  // Post data
  post?: {
    id: string
    title: string
    content: string
    author_name?: string
    address: string
  }
}

export const usePostCoins = () => {
  const [coins, setCoins] = useState<PostCoin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCoins()
  }, [])

  const fetchCoins = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('post_coins')
        .select(`
          *,
          post:posts(
            id,
            title,
            content,
            author_name,
            address
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setCoins(data || [])
    } catch (err) {
      console.error('Error fetching post coins:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch coins')
    } finally {
      setIsLoading(false)
    }
  }

  const getCoinByContractAddress = (contractAddress: string) => {
    return coins.find(coin => coin.contract_address.toLowerCase() === contractAddress.toLowerCase())
  }

  const getCoinBySymbol = (symbol: string) => {
    return coins.find(coin => coin.symbol.toLowerCase() === symbol.toLowerCase())
  }

  return {
    coins,
    isLoading,
    error,
    refetch: fetchCoins,
    getCoinByContractAddress,
    getCoinBySymbol
  }
} 