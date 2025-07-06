'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { ChevronDown, Loader2 } from 'lucide-react'
import { allChains } from '@/lib/wagmi'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function NetworkSwitcher() {
  const chainId = useChainId()
  const { chains = [], error, isPending, switchChain } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)

  // Find the current chain
  const currentChain = allChains.find(chain => chain.id === chainId)

  if (!currentChain) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-colors',
          'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700',
          'border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-200',
          'hover:text-gray-900 dark:hover:text-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
      >
        {currentChain.name}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            {allChains.map((x) => (
              <button
                key={x.id}
                onClick={() => {
                  switchChain?.({ chainId: x.id })
                  setIsOpen(false)
                }}
                disabled={!switchChain || x.id === chainId}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm text-left',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'focus:bg-gray-100 dark:focus:bg-gray-700',
                  'transition-colors cursor-pointer',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'text-gray-700 dark:text-gray-200'
                )}
              >
                {x.iconUrl && (
                  <img 
                    src={x.iconUrl} 
                    alt={x.name}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span>{x.name}</span>
                {isPending && x.id === chainId && (
                  <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-1">
          {error.message}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}