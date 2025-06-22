'use client';

import { useState } from 'react';
import { WagmiProvider, createConfig, http, useAccount } from 'wagmi';
import { baseSepoliaConfig } from '@/lib/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';

// Set up wagmi config
const config = createConfig({
  chains: [baseSepoliaConfig],
  transports: {
    [baseSepoliaConfig.id]: http('https://sepolia.base.org'),
  },
  connectors: [
    injected(),
  ],
});

// Tab component
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
        active
          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

const queryClient = new QueryClient();

// Main test component
function NFTTestContent() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState<'nft' | 'token'>('nft');

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Connect Your Wallet</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Please connect your wallet to test the Zora functionality.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Zora Test Suite</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connected as: <span className="font-mono">{address}</span>
          </p>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="flex -mb-px space-x-1">
              <TabButton 
                active={activeTab === 'nft'} 
                onClick={() => setActiveTab('nft')}
              >
                NFT Testing
              </TabButton>
              <TabButton 
                active={activeTab === 'token'} 
                onClick={() => setActiveTab('token')}
              >
                Token Testing
              </TabButton>
            </nav>
          </div>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {activeTab === 'nft' ? (
            <TestNFTSuite />
          ) : (
            <TestTokenSuite />
          )}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function NFTTestPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NFTTestContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Import the components at the bottom to avoid circular dependencies
import dynamic from 'next/dynamic';

const TestNFTSuite = dynamic(() => import('@/components/TestNFTSuite'), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

const TestTokenSuite = dynamic(() => import('@/components/TestTokenSuite'), { 
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )
});
