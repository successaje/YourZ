import { supabase } from '@/lib/supabase'

export interface NFTDetails {
  id?: string
  post_id: string
  contract_address: string
  token_id: string
  name: string
  description?: string
  image_url?: string
  price?: number
  max_supply?: number
  current_supply?: number
  creator_id: string
  creator_address: string
  metadata_uri?: string
  collection_name?: string
  collection_description?: string
  attributes?: any
  status?: 'minted' | 'listed' | 'sold' | 'burned'
  minted_at?: string
  listed_at?: string
  sold_at?: string
}

export interface UserNFTStats {
  total_nfts: number
  total_value: number
  avg_price: number
  listed_count: number
  sold_count: number
}

export interface RecentNFT {
  id: string
  post_id: string
  contract_address: string
  token_id: string
  name: string
  description?: string
  image_url?: string
  price?: number
  creator_address: string
  status: string
  minted_at: string
  post_title: string
}

export class NFTService {
  /**
   * Save NFT details to the database
   */
  static async saveNFT(nftDetails: NFTDetails): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_nfts')
        .insert([nftDetails])
        .select()
        .single()

      if (error) throw error

      // Update the post to mark it as an NFT
      await supabase
        .from('posts')
        .update({
          is_nft: true,
          nft_contract_address: nftDetails.contract_address,
          nft_token_id: nftDetails.token_id,
          nft_price: nftDetails.price,
          nft_status: nftDetails.status || 'minted'
        })
        .eq('id', nftDetails.post_id)

      return { success: true, data }
    } catch (error) {
      console.error('Error saving NFT:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to save NFT' }
    }
  }

  /**
   * Get NFT details for a specific post
   */
  static async getNFTByPostId(postId: string): Promise<{ success: boolean; data?: NFTDetails; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_nfts')
        .select('*')
        .eq('post_id', postId)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching NFT:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch NFT' }
    }
  }

  /**
   * Get all NFTs created by a user
   */
  static async getUserNFTs(userAddress: string): Promise<{ success: boolean; data?: NFTDetails[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_nfts')
        .select('*')
        .eq('creator_address', userAddress.toLowerCase())
        .order('minted_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user NFTs:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch user NFTs' }
    }
  }

  /**
   * Get NFT statistics for a user
   */
  static async getUserNFTStats(userAddress: string): Promise<{ success: boolean; data?: UserNFTStats; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_nft_stats', { user_address: userAddress.toLowerCase() })

      if (error) throw error

      return { success: true, data: data?.[0] }
    } catch (error) {
      console.error('Error fetching NFT stats:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch NFT stats' }
    }
  }

  /**
   * Get recent NFTs across the platform
   */
  static async getRecentNFTs(limit: number = 10): Promise<{ success: boolean; data?: RecentNFT[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_recent_nfts', { limit_count: limit })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching recent NFTs:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch recent NFTs' }
    }
  }

  /**
   * Update NFT status
   */
  static async updateNFTStatus(
    nftId: string, 
    status: 'minted' | 'listed' | 'sold' | 'burned',
    additionalData?: { listed_at?: string; sold_at?: string; price?: number }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const updateData: any = { status }
      
      if (status === 'listed' && additionalData?.listed_at) {
        updateData.listed_at = additionalData.listed_at
      }
      
      if (status === 'sold' && additionalData?.sold_at) {
        updateData.sold_at = additionalData.sold_at
      }
      
      if (additionalData?.price) {
        updateData.price = additionalData.price
      }

      const { data, error } = await supabase
        .from('post_nfts')
        .update(updateData)
        .eq('id', nftId)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error updating NFT status:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update NFT status' }
    }
  }

  /**
   * Increment current supply when NFT is minted
   */
  static async incrementSupply(nftId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // First get the current supply
      const { data: currentData, error: fetchError } = await supabase
        .from('post_nfts')
        .select('current_supply, max_supply')
        .eq('id', nftId)
        .single()

      if (fetchError) throw fetchError

      // Check if we can increment
      if (currentData.current_supply >= currentData.max_supply) {
        return { success: false, error: 'Maximum supply reached' }
      }

      // Increment the supply
      const { data, error } = await supabase
        .from('post_nfts')
        .update({ 
          current_supply: currentData.current_supply + 1
        })
        .eq('id', nftId)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error incrementing supply:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to increment supply' }
    }
  }

  /**
   * Check if NFT can be minted (supply not exceeded)
   */
  static async canMint(nftId: string): Promise<{ success: boolean; canMint: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_nfts')
        .select('max_supply, current_supply')
        .eq('id', nftId)
        .single()

      if (error) throw error

      const canMint = data.current_supply < data.max_supply

      return { success: true, canMint }
    } catch (error) {
      console.error('Error checking mint availability:', error)
      return { success: false, canMint: false, error: error instanceof Error ? error.message : 'Failed to check mint availability' }
    }
  }

  /**
   * Get NFT by contract address and token ID
   */
  static async getNFTByContractAndToken(
    contractAddress: string, 
    tokenId: string
  ): Promise<{ success: boolean; data?: NFTDetails; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_nfts')
        .select('*')
        .eq('contract_address', contractAddress)
        .eq('token_id', tokenId)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching NFT by contract and token:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch NFT' }
    }
  }

  /**
   * Search NFTs by name or description
   */
  static async searchNFTs(query: string): Promise<{ success: boolean; data?: NFTDetails[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_nfts')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('minted_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error searching NFTs:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to search NFTs' }
    }
  }

  /**
   * Get NFTs by collection name
   */
  static async getNFTsByCollection(collectionName: string): Promise<{ success: boolean; data?: NFTDetails[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('post_nfts')
        .select('*')
        .eq('collection_name', collectionName)
        .order('minted_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching collection NFTs:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch collection NFTs' }
    }
  }
} 