import { createCollectorClient } from '@zoralabs/protocol-sdk'
import { baseSepolia } from 'viem/chains'

export async function testMint({
  contractAddress,
  tokenId,
  walletClient,
  publicClient,
  account,
}: {
  contractAddress: string
  tokenId: string
  walletClient: any
  publicClient: any
  account: string
}) {
  try {
    console.log('Testing mint with:', {
      contractAddress,
      tokenId,
      account,
      hasWalletClient: !!walletClient,
      hasPublicClient: !!publicClient
    })

    // Create collector client
    const collectorClient = createCollectorClient({
      chainId: baseSepolia.id,
      publicClient,
    })

    console.log('Collector client created')

    // Try to get mint parameters
    const { parameters } = await collectorClient.mint({
      tokenContract: contractAddress as `0x${string}`,
      mintType: '1155',
      tokenId: BigInt(tokenId),
      quantityToMint: 1,
      minterAccount: account as `0x${string}`,
    })

    console.log('Mint parameters:', parameters)

    // Execute the transaction
    const hash = await walletClient.writeContract(parameters)
    console.log('Transaction hash:', hash)

    // Wait for receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log('Transaction receipt:', receipt)

    return {
      success: true,
      transactionHash: receipt.transactionHash
    }

  } catch (error) {
    console.error('Test mint error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 