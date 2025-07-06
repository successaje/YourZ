import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { NFTService, NFTDetails, UserNFTStats, RecentNFT } from '@/services/nftService'
import { toast } from 'react-hot-toast'

export const useNFTService = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  const saveNFT = useCallback(async (nftDetails: Omit<NFTDetails, 'creator_id' | 'creator_address'>) => {
    if (!address) {
      toast.error('Please connect your wallet')
      return { success: false, error: 'Wallet not connected' }
    }

    setIsLoading(true)
    try {
      const result = await NFTService.saveNFT({
        ...nftDetails,
        creator_address: address.toLowerCase(),
        creator_id: address.toLowerCase(), // Using address as creator_id for now
        status: 'minted'
      })

      if (result.success) {
        toast.success('NFT saved successfully!')
      } else {
        toast.error(result.error || 'Failed to save NFT')
      }

      return result
    } catch (error) {
      console.error('Error in saveNFT:', error)
      toast.error('Failed to save NFT')
      return { success: false, error: 'Failed to save NFT' }
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const getUserNFTs = useCallback(async (userAddress?: string) => {
    const targetAddress = userAddress || address
    if (!targetAddress) {
      return { success: false, error: 'No address provided' }
    }

    setIsLoading(true)
    try {
      const result = await NFTService.getUserNFTs(targetAddress)
      return result
    } catch (error) {
      console.error('Error in getUserNFTs:', error)
      return { success: false, error: 'Failed to fetch user NFTs' }
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const getUserNFTStats = useCallback(async (userAddress?: string) => {
    const targetAddress = userAddress || address
    if (!targetAddress) {
      return { success: false, error: 'No address provided' }
    }

    setIsLoading(true)
    try {
      const result = await NFTService.getUserNFTStats(targetAddress)
      return result
    } catch (error) {
      console.error('Error in getUserNFTStats:', error)
      return { success: false, error: 'Failed to fetch NFT stats' }
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const getRecentNFTs = useCallback(async (limit: number = 10) => {
    setIsLoading(true)
    try {
      const result = await NFTService.getRecentNFTs(limit)
      return result
    } catch (error) {
      console.error('Error in getRecentNFTs:', error)
      return { success: false, error: 'Failed to fetch recent NFTs' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getNFTByPostId = useCallback(async (postId: string) => {
    setIsLoading(true)
    try {
      const result = await NFTService.getNFTByPostId(postId)
      return result
    } catch (error) {
      console.error('Error in getNFTByPostId:', error)
      return { success: false, error: 'Failed to fetch NFT' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateNFTStatus = useCallback(async (
    nftId: string,
    status: 'minted' | 'listed' | 'sold' | 'burned',
    additionalData?: { listed_at?: string; sold_at?: string; price?: number }
  ) => {
    if (!address) {
      toast.error('Please connect your wallet')
      return { success: false, error: 'Wallet not connected' }
    }

    setIsLoading(true)
    try {
      const result = await NFTService.updateNFTStatus(nftId, status, additionalData)
      
      if (result.success) {
        toast.success(`NFT status updated to ${status}`)
      } else {
        toast.error(result.error || 'Failed to update NFT status')
      }

      return result
    } catch (error) {
      console.error('Error in updateNFTStatus:', error)
      toast.error('Failed to update NFT status')
      return { success: false, error: 'Failed to update NFT status' }
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const searchNFTs = useCallback(async (query: string) => {
    setIsLoading(true)
    try {
      const result = await NFTService.searchNFTs(query)
      return result
    } catch (error) {
      console.error('Error in searchNFTs:', error)
      return { success: false, error: 'Failed to search NFTs' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getNFTsByCollection = useCallback(async (collectionName: string) => {
    setIsLoading(true)
    try {
      const result = await NFTService.getNFTsByCollection(collectionName)
      return result
    } catch (error) {
      console.error('Error in getNFTsByCollection:', error)
      return { success: false, error: 'Failed to fetch collection NFTs' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    saveNFT,
    getUserNFTs,
    getUserNFTStats,
    getRecentNFTs,
    getNFTByPostId,
    updateNFTStatus,
    searchNFTs,
    getNFTsByCollection
  }
} 