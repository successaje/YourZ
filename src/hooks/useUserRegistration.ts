import { useState } from 'react'
import axios from 'axios'

interface UserData {
  address: string
  username: string
  email: string
}

export const useUserRegistration = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<UserData | null>(null)

  const registerUser = async (userData: UserData) => {
    try {
      setIsLoading(true)
      setError(null)

      // Upload to IPFS via Pinata
      const formData = new FormData()
      formData.append('file', new Blob([JSON.stringify(userData)], { type: 'application/json' }))

      const pinataResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      const ipfsHash = pinataResponse.data.IpfsHash

      // Register user through API route
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          ipfsHash
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to register user')
      }

      const newUser = await response.json()
      setUser(newUser)
      return newUser
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Failed to register user')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    registerUser,
    isLoading,
    error,
    user
  }
} 