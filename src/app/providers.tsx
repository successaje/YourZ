'use client'

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import '@rainbow-me/rainbowkit/styles.css'

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [
    publicProvider({
      priority: 1,
      stallTimeout: 5000,
    }),
  ]
)

// Set up wagmi config
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID')
}

const { connectors } = getDefaultWallets({
  appName: 'YourZ',
  projectId: projectId || '',
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains} 
        modalSize="compact"
        initialChain={mainnet}
      >
        <div className="min-h-screen bg-gray-50 dark:bg-dark-100 transition-colors duration-200">
          {children}
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  )
} 