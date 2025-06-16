// src/lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect, injected } from 'wagmi/connectors'
import { zora, zoraSepolia } from './networks'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Configure chains - now including Zora networks
export const allChains = [mainnet, sepolia, zora, zoraSepolia] as const

// Create wagmi config
export const config = createConfig({
  chains: allChains,
  transports: {
    [mainnet.id]: http('https://rpc.ankr.com/eth'),
    [sepolia.id]: http('https://rpc.ankr.com/eth_sepolia'),
    [zora.id]: http('https://rpc.zora.energy'),
    [zoraSepolia.id]: http('https://sepolia.rpc.zora.energy'),
  },
  connectors: [
    metaMask({
      dappMetadata: { name: 'YourZ' },
      chains: allChains,
    }),
    injected({
      target: 'metaMask',
      chains: allChains,
    }),
    ...(projectId ? [walletConnect({
      projectId,
      showQrModal: true,
      qrModalOptions: {
        themeVariables: {
          '--w3m-z-index': '9999'
        } as Record<string, string>
      },
      metadata: {
        name: 'YourZ',
        description: 'Web3 Content Platform',
        url: 'https://yourz.xyz',
        icons: ['https://yourz.xyz/icon.png']
      }
    })] : [])
  ],
  ssr: true
})