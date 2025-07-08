import { useState } from 'react'
import axios from 'axios'

interface UserData {
  address: string
  username: string
  email?: string
}

export const useUserRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<UserData | null>(null)

  const registerUser = async (userData: UserData) => {
    try {
      setIsRegistering(true)
      setError(null)
      console.log('Starting registration for:', userData.address)

      let ipfsHash = ''

      // Try to upload to IPFS via Pinata (optional)
      try {
        if (process.env.NEXT_PUBLIC_PINATA_JWT) {
          console.log('Attempting IPFS upload...')
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

          ipfsHash = pinataResponse.data.IpfsHash
          console.log('IPFS upload successful:', ipfsHash)
        } else {
          console.log('No Pinata JWT found, skipping IPFS upload')
          // Generate a placeholder hash for now
          ipfsHash = 'bafybeihj5z3b2g4d4q4z4y5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q'
        }
      } catch (ipfsError) {
        console.warn('IPFS upload failed, continuing with registration:', ipfsError)
        // Generate a placeholder hash for now
        ipfsHash = 'bafybeihj5z3b2g4d4q4z4y5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q'
      }

      console.log('Registering user through API...')
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

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.error || 'Failed to register user')
      }

      const newUser = await response.json()
      console.log('Registration successful:', newUser)
      setUser(newUser)
      return newUser
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Failed to register user')
      throw error
    } finally {
      console.log('Setting isRegistering to false')
      setIsRegistering(false)
    }
  }

  return {
    registerUser,
    isRegistering,
    error,
    user
  }
} 