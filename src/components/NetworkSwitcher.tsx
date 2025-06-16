
'use client'

import { useNetwork, useSwitchNetwork } from 'wagmi'
import { Button } from './ui/button'
import { ChevronDown, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { allChains } from '@/lib/wagmi'
import { cn } from '@/lib/utils'

export function NetworkSwitcher() {
  const { chain } = useNetwork()
  const { chains = [], error, isPending, switchNetwork } = useSwitchNetwork()

  if (!chain) return null

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            'gap-2 transition-colors',
            'bg-background hover:bg-muted',
            'border-border text-foreground',
            'hover:text-foreground/80',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}>
            {chain.name}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
          {allChains.map((x) => (
            <DropdownMenuItem
              key={x.id}
              onClick={() => switchNetwork?.(x.id)}
              disabled={!switchNetwork || x.id === chain?.id}
              className={cn(
                'flex items-center gap-2 text-foreground',
                'hover:bg-muted hover:text-foreground',
                'focus:bg-muted focus:text-foreground',
                'transition-colors',
                'cursor-pointer',
                'px-2 py-1.5 text-sm rounded-md',
                'outline-none',
                'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none'
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
              {isPending && x.id === chain?.id && (
                <Loader2 className="h-4 w-4 animate-spin ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <div className="text-red-500 text-sm mt-1">
          {error.message}
        </div>
      )}
    </div>
  )
}