'use client'

import { useCallback } from 'react'
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { createCoinCall, tradeCoinCall, DeployCurrency } from '@zoralabs/coins-sdk'
import { parseEther } from 'viem'
import type { Address } from 'viem'

export function useZora() {
  const { address } = useAccount()

  // Create a new coin (blog post)
  const createPost = useCallback(
    async (params: {
      title: string
      content: string
      price: string
      uri: string
    }) => {
      if (!address) return

      const coinParams = {
        name: params.title,
        symbol: 'POST', // You might want to make this unique per post
        uri: params.uri,
        payoutRecipient: address as Address,
        currency: DeployCurrency.ETH,
      }

      const contractCallParams = await createCoinCall(coinParams)

      return contractCallParams
    },
    [address]
  )

  // Buy a coin (collect a post)
  const collectPost = useCallback(
    async (coinAddress: Address, amount: string) => {
      if (!address) return

      const tradeParams = {
        direction: 'buy' as const,
        target: coinAddress,
        args: {
          recipient: address,
          orderSize: parseEther(amount),
          minAmountOut: 0n,
        },
      }

      const contractCallParams = tradeCoinCall(tradeParams)

      return contractCallParams
    },
    [address]
  )

  // Sell a coin (resell a post)
  const resellPost = useCallback(
    async (coinAddress: Address, amount: string) => {
      if (!address) return

      const tradeParams = {
        direction: 'sell' as const,
        target: coinAddress,
        args: {
          recipient: address,
          orderSize: parseEther(amount),
          minAmountOut: 0n,
        },
      }

      const contractCallParams = tradeCoinCall(tradeParams)

      return contractCallParams
    },
    [address]
  )

  return {
    createPost,
    collectPost,
    resellPost,
  }
} 