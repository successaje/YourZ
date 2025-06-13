'use client'

import { useCallback } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { createCreatorClient } from '@zoralabs/protocol-sdk'
import { zora } from 'viem/chains'

export function useZora() {
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const createNFT = async ({
    name,
    symbol,
    royaltyBps,
    tokenURI,
    mintPrice,
  }: {
    name: string
    symbol: string
    royaltyBps: number
    tokenURI: string
    mintPrice: string
  }) => {
    if (!address || !publicClient) {
      throw new Error('Wallet not connected')
    }

    const creatorClient = createCreatorClient({
      chain: zora,
      publicClient,
    })

    const { request } = await creatorClient.createNew1155Contract({
      name,
      symbol,
      royaltyBps,
      royaltyRecipient: address,
      tokenURI,
      mintPrice,
    })

    return request
  }

  return {
    createNFT,
  }
} 