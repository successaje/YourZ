'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export interface CoinFormData {
  name: string
  symbol: string
  mintFee: string
  image?: File
  imagePreview?: string
}

interface CoinMintFormProps {
  formData: CoinFormData
  onNameChange: (name: string) => void
  onSymbolChange: (symbol: string) => void
  onMintFeeChange: (fee: string) => void
  onImageChange: (file: File | null) => void
  isSubmitting?: boolean
}

export default function CoinMintForm({ 
  formData, 
  onNameChange,
  onSymbolChange,
  onMintFeeChange,
  onImageChange,
  isSubmitting = false
}: CoinMintFormProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    onImageChange(file)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value)
  }

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow uppercase letters and numbers, max 5 characters
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)
    onSymbolChange(value)
  }

  const handleMintFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '')
    onMintFeeChange(value)
  }

  if (!isClient) {
    return null
  }

  return (
    <motion.div 
      className="mt-4 p-4 border rounded-lg bg-gray-50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-lg font-medium mb-3">Create YourPost Coin</h3>
      
      <div className="space-y-4">
        {/* Coin Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coin Image
          </label>
          <div className="mt-1 flex items-center">
            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                {formData.imagePreview ? (
                  <img 
                    src={formData.imagePreview} 
                    alt="Coin preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs block mt-1">Upload</span>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isSubmitting}
                />
              </div>
            </label>
            <div className="ml-4 text-sm text-gray-500">
              <p>Recommended size: 512x512px</p>
              <p>Max size: 5MB</p>
            </div>
          </div>
        </div>

        {/* Coin Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coin Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g. My Community Coin"
            className="w-full p-2 border rounded-md"
            disabled={isSubmitting}
          />
        </div>

        {/* Coin Symbol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coin Symbol
          </label>
          <input
            type="text"
            value={formData.symbol}
            onChange={handleSymbolChange}
            placeholder="e.g. POST"
            maxLength={5}
            className="w-32 p-2 border rounded-md"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            2-5 uppercase letters/numbers only
          </p>
        </div>

        {/* Mint Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mint Fee (ETH)
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              value={formData.mintFee}
              onChange={handleMintFeeChange}
              className="w-32 p-2 border rounded-md"
              placeholder="0.000777"
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">ETH</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Fee charged per mint (default: 0.000777 ETH)
          </p>
        </div>

        {/* Zora Coin Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            About Zora Coins
          </h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Zora coins use a bonding curve model for tokenomics</p>
            <p>• No fixed initial supply - tokens are minted on demand</p>
            <p>• Price increases as more tokens are minted</p>
            <p>• You'll receive mint fees and can set the bonding curve</p>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>• You will be the admin of this token</p>
          <p>• Tokens can be used for community engagement</p>
          <p>• 1% of supply will be airdropped to the platform</p>
        </div>
      </div>
    </motion.div>
  )
}
