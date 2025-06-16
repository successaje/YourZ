import { Chain } from 'wagmi'

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

export const zoraSepolia: Chain = {
  id: 999999999,
  name: 'Zora Sepolia',
  network: 'zora-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.rpc.zora.energy'] },
    default: { http: ['https://sepolia.rpc.zora.energy'] },
  },
  blockExplorers: {
    default: { 
      name: 'Zora Sepolia Explorer', 
      url: 'https://sepolia.explorer.zora.energy' 
    },
  },
  testnet: true,
  iconUrl: 'https://zora.co/favicon.ico',
}
