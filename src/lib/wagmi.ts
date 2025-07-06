// src/lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { baseSepolia } from 'viem/chains'
import { metaMask, walletConnect, injected } from 'wagmi/connectors'
import { zora, baseSepoliaConfig } from './networks'

// Use the baseSepoliaConfig from networks.ts
const baseSepoliaWithConfig = baseSepoliaConfig

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Configure chains - including Zora and Base Sepolia (where your contract is)
export const allChains = [mainnet, sepolia, zora, baseSepoliaWithConfig] as const

// Create wagmi config
export const config = createConfig({
  chains: allChains,
  transports: {
    [mainnet.id]: http('https://rpc.ankr.com/eth'),
    [sepolia.id]: http('https://rpc.ankr.com/eth_sepolia'),
    [zora.id]: http('https://rpc.zora.energy'),
    [baseSepoliaConfig.id]: http('https://sepolia.base.org'),
  },
  connectors: [
    metaMask({
      dappMetadata: { name: 'YourZ' }
    }),
    injected({
      target: 'metaMask'
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