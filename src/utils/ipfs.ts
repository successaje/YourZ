import axios from 'axios'
import FormData from 'form-data'

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

export function useIPFS() {
  const uploadToIPFS = async (content: string) => {
    try {
      const formData = new FormData()
      formData.append('file', JSON.stringify(content))

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        content,
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        }
      )

      return response.data.IpfsHash
    } catch (error) {
      console.error('Error uploading to IPFS:', error)
      throw error
    }
  }

  const getFromIPFS = async (hash: string) => {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`)
      return response.data
    } catch (error) {
      console.error('Error retrieving from IPFS:', error)
      throw error
    }
  }

  return {
    uploadToIPFS,
    getFromIPFS,
  }
} 