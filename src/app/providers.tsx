'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { useTheme } from 'next-themes'
import { config, allChains } from '@/lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

// Base theme configuration
const baseTheme = {
  accentColor: '#4F46E5',
  accentColorForeground: 'white',
  borderRadius: 'medium' as const,
  fontStack: 'system' as const,
  overlayBlur: 'small' as const,
}

function RainbowKitThemedProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  
  // Create theme based on current theme
  const rainbowKitTheme = theme === 'dark' 
    ? darkTheme({ ...baseTheme })
    : lightTheme({ ...baseTheme })

  return (
    <RainbowKitProvider 
      theme={rainbowKitTheme}
    >
      {children}
    </RainbowKitProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  // Ensure we're in the browser before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <div style={{ visibility: 'hidden' }}>{children}</div>
        </QueryClientProvider>
      </WagmiProvider>
    )
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitThemedProvider>
          {children}
        </RainbowKitThemedProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 