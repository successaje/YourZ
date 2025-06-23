// 
import { WagmiConfig, createConfig } from 'wagmi'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { zora, zoraSepolia } from '@wagmi/core/chains'

const { connectors } = getDefaultWallets({
  appName: 'YourZ',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID!,
  chains: [zoraSepolia] // Or zora for mainnet
})

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient: publicClient({ 
    chain: zoraSepolia,
    transport: http() 
  })
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={[zoraSepolia]}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}


<!-- Create library -->

import { createZoraPremintClient } from '@zoralabs/protocol-sdk'
import { zoraSepolia } from '@zoralabs/protocol-sdk/chains'
import { walletClient } from './wallet'

export const zoraClient = () => 
  createZoraPremintClient({
    chain: zoraSepolia,
    signer: walletClient,
  })



// The mint

'use client'
import { useState } from 'react'
import { useWalletClient } from 'wagmi'
import { storePostOnIPFS } from '@/lib/ipfs'
import { zoraClient } from '@/lib/zora'

export function MintPostButton() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const { data: walletClient } = useWalletClient()

  const mint = async () => {
    if (!walletClient) return
    
    // 1. Store on IPFS
    const ipfsUri = await storePostOnIPFS({ title, content })
    
    // 2. Mint with Zora
    const client = zoraClient()
    const { tokenId } = await client.mint({
      tokenContract: process.env.NEXT_PUBLIC_ZORA_1155_CONTRACT!,
      tokenURI: ipfsUri,
      mintToAddress: walletClient.account.address,
      quantity: 1,
      pricePerToken: 0 // Free mint with royalties
    })

    console.log('Minted token:', tokenId)
  }

  return (
    <div>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Post title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your content..."
      />
      <button onClick={mint}>Publish as NFT</button>
    </div>
  )
}


// IPFS storage helper
import { NFTStorage } from 'nft.storage'

export async function storePostOnIPFS(post: { 
  title: string; 
  content: string 
}) {
  const client = new NFTStorage({ 
    token: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY! 
  })
  
  const metadata = await client.store({
    name: post.title,
    description: post.content.slice(0, 100),
    content: new Blob([post.content], { type: 'text/plain' }),
    type: 'yourz-post'
  })

  return metadata.url // ipfs://CID
}

// Index maybe

import { useZoraNFTs } from '@zoralabs/protocol-sdk'

export default function Home() {
  const { data: nfts } = useZoraNFTs({
    where: {
      collectionAddresses: [process.env.NEXT_PUBLIC_ZORA_1155_CONTRACT!]
    },
    chain: zoraSepolia
  })

  return (
    <div>
      {nfts?.map(nft => (
        <PostCard 
          key={nft.tokenId} 
          tokenId={nft.tokenId} 
          metadataUri={nft.tokenURI}
        />
      ))}
    </div>
  )
}