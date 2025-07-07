'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { X, ExternalLink, TrendingUp, Users, Activity, Coins, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { FaCoins, FaExternalLinkAlt, FaEye } from 'react-icons/fa'

interface CoinActivity {
  id: string
  type: 'mint' | 'transfer' | 'burn'
  from: string
  to: string
  amount: string
  timestamp: string
  txHash: string
  price?: string
}

interface CoinDetails {
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
  // Additional data from APIs
  currentPrice?: string
  marketCap?: string
  volume24h?: string
  holders?: number
  activities?: CoinActivity[]
}

interface CoinModalProps {
  isOpen: boolean
  onClose: () => void
  coin: CoinDetails | null
}

export default function CoinModal({ isOpen, onClose, coin }: CoinModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'holders'>('overview')

  useEffect(() => {
    if (isOpen && coin) {
      fetchCoinData()
    }
  }, [isOpen, coin])

  const fetchCoinData = async () => {
    if (!coin) return
    
    setIsLoading(true)
    try {
      // Simulate fetching data from BaseScan and Zora APIs
      // In a real implementation, you would make actual API calls here
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error fetching coin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toString()
  }

  const mockActivities: CoinActivity[] = [
    {
      id: '1',
      type: 'mint',
      from: '0x0000000000000000000000000000000000000000',
      to: '0x1234567890123456789012345678901234567890',
      amount: '1000',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      txHash: '0xabc123...',
      price: '0.001'
    },
    {
      id: '2',
      type: 'transfer',
      from: '0x1234567890123456789012345678901234567890',
      to: '0x2345678901234567890123456789012345678901',
      amount: '500',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      txHash: '0xdef456...'
    },
    {
      id: '3',
      type: 'mint',
      from: '0x0000000000000000000000000000000000000000',
      to: '0x3456789012345678901234567890123456789012',
      amount: '2000',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      txHash: '0xghi789...',
      price: '0.0015'
    }
  ]

  if (!coin) return null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <FaCoins className="w-5 h-5 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                  {coin.name}
                </Dialog.Title>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {coin.symbol} • Created {formatDate(coin.created_at)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
                  { id: 'activities', label: 'Activities', icon: <Activity className="w-4 h-4" /> },
                  { id: 'holders', label: 'Holders', icon: <Users className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Contract Address</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {formatAddress(coin.contract_address)}
                            </span>
                            <a
                              href={`https://sepolia.basescan.org/token/${coin.contract_address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <FaExternalLinkAlt className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Supply</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatNumber(coin.total_supply)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Creator</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatAddress(coin.creator_id)}
                          </span>
                        </div>
                        {coin.posts?.title && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Associated Post</span>
                            <span className="font-semibold text-gray-900 dark:text-white truncate max-w-32">
                              {coin.posts.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Data</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Current Price</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {coin.currentPrice || '0.001'} ETH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Market Cap</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {coin.marketCap || '1.2M'} ETH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">24h Volume</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {coin.volume24h || '45.2K'} ETH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Holders</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {coin.holders || '342'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`https://testnet.zora.co/coin/bsep:${coin.contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <FaEye className="w-4 h-4 mr-2" />
                        View on Zora
                      </a>
                      <a
                        href={`https://sepolia.basescan.org/token/${coin.contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                        View on BaseScan
                      </a>
                      <a
                        href={`/trade?coin=${coin.contract_address}&symbol=${coin.symbol}`}
                        className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Trade
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activities' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
                  {mockActivities.map((activity) => (
                    <div key={activity.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'mint' ? 'bg-green-100 text-green-600' :
                            activity.type === 'transfer' ? 'bg-blue-100 text-blue-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {activity.type === 'mint' ? <ArrowUpRight className="w-4 h-4" /> :
                             activity.type === 'transfer' ? <Activity className="w-4 h-4" /> :
                             <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {activity.type}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatNumber(parseInt(activity.amount))} {coin.symbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(activity.timestamp)}
                          </p>
                          {activity.price && (
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.price} ETH
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>From: {formatAddress(activity.from)}</span>
                          <span>To: {formatAddress(activity.to)}</span>
                        </div>
                        <a
                          href={`https://sepolia.basescan.org/tx/${activity.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
                        >
                          View Transaction →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'holders' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Holders</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      Holder data will be displayed here when available from BaseScan API
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 