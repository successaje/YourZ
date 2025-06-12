'use client'

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import '@rainbow-me/rainbowkit/styles.css'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')
}

const { chains, publicClient } = configureChains(
  [mainnet, sepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://rpc.ankr.com/${chain.network}`,
        webSocket: `wss://rpc.ankr.com/${chain.network}/ws`,
      }),
    }),
    publicProvider()
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'YourZ',
  projectId,
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains} 
        modalSize="compact"
        initialChain={sepolia}
        showRecentTransactions={true}
      >
        <div className="min-h-screen bg-gray-50 dark:bg-dark-100 transition-colors duration-200">
          {children}
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  )
} 