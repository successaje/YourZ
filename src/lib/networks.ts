import type { Chain } from 'viem'
import { baseSepolia as viemBaseSepolia } from 'viem/chains'

export const zora: Chain = {
  id: 7777777,
  name: 'Zora',
  network: 'zora',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc.zora.energy'] },
    default: { http: ['https://rpc.zora.energy'] },
  },
  blockExplorers: {
    default: { 
      name: 'Zora Explorer', 
      url: 'https://explorer.zora.energy' 
    },
  },
  iconUrl: 'https://zora.co/favicon.ico',
}

export const baseSepoliaConfig: Chain = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.base.org'] },
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { 
      name: 'Basescan', 
      url: 'https://sepolia.basescan.org' 
    },
  },
  testnet: true,
  iconUrl: 'https://base.org/favicon.ico',
}
