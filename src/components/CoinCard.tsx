import { useState } from 'react'
import Link from 'next/link'
import { FaCoins, FaExternalLinkAlt, FaCopy, FaCheck, FaEye } from 'react-icons/fa'
import { UserCoin } from '@/hooks/useUserCoins'
import { toast } from 'react-hot-toast'

interface CoinCardProps {
  coin: UserCoin
}

export default function CoinCard({ coin }: CoinCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopied(false), 1000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    } else {
      return num.toFixed(2)
    }
  }

  const formatPercentage = (balance: string, totalSupply: number) => {
    const num = parseFloat(balance)
    const percentage = (num / totalSupply) * 100
    return percentage.toFixed(2)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <FaCoins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {coin.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {coin.symbol}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(coin.contract_address, 'Contract address')}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="Copy contract address"
          >
            {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
          </button>
          <Link
            href={`https://sepolia.basescan.org/token/${coin.contract_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="View on BaseScan"
          >
            <FaExternalLinkAlt className="w-4 h-4" />
          </Link>
          <Link
            href={`https://testnet.zora.co/coin/bsep:${coin.contract_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
            title="View on Zora"
          >
            <FaEye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Associated Post */}
      {coin.post_title && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Associated Post:</p>
          <Link 
            href={`/post/${coin.post_id}`}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {coin.post_title}
          </Link>
        </div>
      )}

      {/* Balance and Supply Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Balance</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatBalance(coin.balance || '0')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatPercentage(coin.balance || '0', coin.total_supply)}% of supply
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Supply</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatBalance(coin.total_supply.toString())}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {coin.symbol} tokens
          </p>
        </div>
      </div>

      {/* Contract Address */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contract Address:</p>
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs font-mono">
          <span className="text-gray-700 dark:text-gray-300 truncate">
            {coin.contract_address}
          </span>
          <button
            onClick={() => copyToClipboard(coin.contract_address, 'Contract address')}
            className="text-gray-400 hover:text-blue-500 transition-colors"
          >
            <FaCopy className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Created: {formatDate(coin.created_at)}</span>
        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
          Creator
        </span>
      </div>
    </div>
  )
} 