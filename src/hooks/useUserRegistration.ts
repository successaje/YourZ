import { useState } from 'react'
import axios from 'axios'

interface UserData {
  address: string
  username: string
  email?: string
  createdAt: string
}

interface UseUserRegistrationReturn {
  registerUser: (data: Omit<UserData, 'createdAt'>) => Promise<void>
  isRegistering: boolean
  error: string | null
}

export function useUserRegistration(): UseUserRegistrationReturn {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerUser = async (data: Omit<UserData, 'createdAt'>) => {
    setIsRegistering(true)
    setError(null)

    try {
      // Check if username is already taken
      const usernameCheck = await fetch(`/api/users/check-username?username=${data.username}`)
      const { isTaken } = await usernameCheck.json()

      if (isTaken) {
        throw new Error('Username is already taken')
      }

      // Prepare user data
      const userData: UserData = {
        ...data,
        createdAt: new Date().toISOString(),
      }

      // Upload to IPFS via Pinata
      const formData = new FormData()
      formData.append('file', new Blob([JSON.stringify(userData)], { type: 'application/json' }))

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
        }
      })

      const ipfsHash = response.data.IpfsHash

      // Store the IPFS hash in your backend
      await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: data.address,
          username: data.username,
          ipfsHash,
        }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register user')
      throw err
    } finally {
      setIsRegistering(false)
    }
  }

  return {
    registerUser,
    isRegistering,
    error,
  }
} 