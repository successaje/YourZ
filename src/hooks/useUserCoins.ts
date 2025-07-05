import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { supabase } from '@/lib/supabase'
import { formatEther, parseEther } from 'viem'

export interface UserCoin {
  id: string
  post_id: string
  contract_address: string
  name: string
  symbol: string
  total_supply: number
  creator_id: string
  metadata_uri: string
  created_at: string
  post_title?: string
  balance?: string
  price?: string
}

export function useUserCoins(userAddress?: string) {
  const [coins, setCoins] = useState<UserCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { address: connectedAddress } = useAccount()
  const publicClient = usePublicClient()

  const address = userAddress || connectedAddress

  useEffect(() => {
    const fetchUserCoins = async () => {
      if (!address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch coins created by the user
        const { data: createdCoins, error: createdError } = await supabase
          .from('post_coins')
          .select(`
            *,
            posts!post_coins_post_id_fkey (
              title
            )
          `)
          .eq('creator_id', address.toLowerCase())

        if (createdError) {
          throw createdError
        }

        // Transform the data
        const userCoins: UserCoin[] = (createdCoins || []).map(coin => ({
          id: coin.id,
          post_id: coin.post_id,
          contract_address: coin.contract_address,
          name: coin.name,
          symbol: coin.symbol,
          total_supply: coin.total_supply,
          creator_id: coin.creator_id,
          metadata_uri: coin.metadata_uri,
          created_at: coin.created_at,
          post_title: coin.posts?.title
        }))

        // Fetch balances for each coin
        const coinsWithBalances = await Promise.all(
          userCoins.map(async (coin) => {
            try {
              // Get user's balance of this coin
              const balance = await publicClient.readContract({
                address: coin.contract_address as `0x${string}`,
                abi: [
                  {
                    name: 'balanceOf',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [{ name: 'account', type: 'address' }],
                    outputs: [{ name: '', type: 'uint256' }]
                  },
                  {
                    name: 'totalSupply',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [],
                    outputs: [{ name: '', type: 'uint256' }]
                  }
                ],
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
              })

              // Get total supply
              const totalSupply = await publicClient.readContract({
                address: coin.contract_address as `0x${string}`,
                abi: [
                  {
                    name: 'totalSupply',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [],
                    outputs: [{ name: '', type: 'uint256' }]
                  }
                ],
                functionName: 'totalSupply',
                args: []
              })

              return {
                ...coin,
                balance: formatEther(balance),
                total_supply: Number(formatEther(totalSupply))
              }
            } catch (err) {
              console.error(`Error fetching balance for ${coin.symbol}:`, err)
              return {
                ...coin,
                balance: '0',
                total_supply: coin.total_supply
              }
            }
          })
        )

        setCoins(coinsWithBalances)
      } catch (err) {
        console.error('Error fetching user coins:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch coins')
      } finally {
        setLoading(false)
      }
    }

    fetchUserCoins()
  }, [address, publicClient])

  return { coins, loading, error }
} 