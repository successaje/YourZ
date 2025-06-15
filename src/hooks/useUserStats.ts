import { useState } from 'react'
import { toast } from 'react-hot-toast'

type StatType = 'post' | 'collection' | 'nft' | 'like'
type StatAction = 'increment' | 'decrement'

export function useUserStats() {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateStats = async (userId: string, type: StatType, action: StatAction) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/users/stats/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, action })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update stats')
      }

      const updatedStats = await response.json()
      return updatedStats
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update stats')
      toast.error(error.message)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    updateStats,
    isUpdating
  }
} 