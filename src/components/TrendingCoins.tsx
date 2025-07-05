import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaCoins, FaExternalLinkAlt, FaEye } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'

interface TrendingCoin {
  id: string
  post_id: string
  contract_address: string
  name: string
  symbol: string
  total_supply: number
  creator_id: string
  metadata_uri: string
  created_at: string
  posts?: {
    title: string
  }
}

export default function TrendingCoins() {
  const [coins, setCoins] = useState<TrendingCoin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        setLoading(true)
        
        // Fetch recent coins with their associated posts
        const { data, error } = await supabase
          .from('post_coins')
          .select(`
            *,
            posts!post_coins_post_id_fkey (
              title
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.error('Error fetching trending coins:', error)
          return
        }

        setCoins(data || [])
      } catch (err) {
        console.error('Error fetching trending coins:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingCoins()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatSupply = (supply: number) => {
    if (supply >= 1000000) {
      return `${(supply / 1000000).toFixed(1)}M`
    } else if (supply >= 1000) {
      return `${(supply / 1000).toFixed(1)}K`
    }
    return supply.toString()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (coins.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <FaCoins className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm">No coins created yet</p>
        <p className="text-xs mt-1">Be the first to create a coin!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <FaCoins className="w-3 h-3 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {coin.name}
                </h4>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {coin.symbol}
                </span>
              </div>
              
              {coin.posts?.title && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                  From: {coin.posts.title}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Supply: {formatSupply(coin.total_supply)}</span>
                <span>Created: {formatDate(coin.created_at)}</span>
              </div>
            </div>
            
            <div className="flex gap-1 ml-2">
              <Link
                href={`https://testnet.zora.co/coin/bsep:${coin.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                title="View on Zora"
              >
                <FaEye className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`https://sepolia.basescan.org/token/${coin.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                title="View on BaseScan"
              >
                <FaExternalLinkAlt className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-2">
        <Link
          href="/coins"
          className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
        >
          View all coins →
        </Link>
      </div>
    </div>
  )
} 