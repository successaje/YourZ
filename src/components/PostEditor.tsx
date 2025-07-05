'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useZora } from '@/hooks/useZora'
import { useZoraMinter } from '@/hooks/useZoraMinter'
import { uploadToIPFS, uploadFileToIPFS } from '@/lib/ipfs'
import type { PostMetadata } from '@/types/post'
import { NFTFormData } from '@/types/nft'
import { toast } from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import NFTMintForm from './NFTMintForm'
import CoinMintForm, { CoinFormData } from './CoinMintForm'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface PostEditorProps {
  onSave: (content: string, metadata: PostMetadata) => Promise<void>
  onWordCountChange?: (count: number) => void
  isLoading?: boolean
}

export default function PostEditor({ 
  onSave, 
  onWordCountChange, 
  isLoading = false
}: PostEditorProps) {
  const [showNFTForm, setShowNFTForm] = useState(false)
  const [showCoinForm, setShowCoinForm] = useState(false)
  const [nftFormData, setNftFormData] = useState<NFTFormData>({
    price: '0.01',
    royaltyBps: '500', // 5%
    coverImage: null,
    coverImagePreview: '',
    description: '',
  })

  const [coinFormData, setCoinFormData] = useState<CoinFormData>({
    name: '',
    symbol: '',
    mintFee: '0.000777',
    image: undefined,
    imagePreview: ''
  })

  const handleNFTToggle = () => {
    setShowNFTForm(!showNFTForm)
    if (showNFTForm) {
      // Reset form when hiding
      setNftFormData({
        price: '0.01',
        royaltyBps: '500',
        coverImage: null,
        coverImagePreview: '',
        description: '',
      })
    }
  }

  const handleCoinToggle = () => {
    setShowCoinForm(!showCoinForm)
    if (!showCoinForm) {
      // Set default title-based name when showing the form
      const defaultName = title ? `${title} Coin` : 'Community Coin'
      setCoinFormData({
        name: defaultName,
        symbol: '',
        mintFee: '0.000777',
        image: undefined,
        imagePreview: ''
      })
    } else {
      // Reset form when hiding
      setCoinFormData({
        name: '',
        symbol: '',
        mintFee: '0.000777',
        image: undefined,
        imagePreview: ''
      })
    }
  }

  // Helper function to update coin form data with all required fields
  const updateCoinFormData = (updates: Partial<CoinFormData>) => {
    setCoinFormData(prev => ({
      ...prev,
      ...updates,
      // Ensure required fields always have values
      name: updates.name ?? prev.name,
      symbol: updates.symbol ?? prev.symbol,
      mintFee: updates.mintFee ?? prev.mintFee
    }))
  }

  const router = useRouter()
  const { address } = useAccount()
  const { createNFT } = useZora()
  const { mintNFT, isMinting } = useZoraMinter()
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()])
      }
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setCoverImage(file);
        setCoverImagePreview(URL.createObjectURL(file));
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    
    if (!content || content === '<p><br></p>') {
      toast.error('Please enter some content')
      return
    }
    
    if (showCoinForm && (!coinFormData.symbol || coinFormData.symbol.length < 2)) {
      toast.error('Please enter a valid coin symbol (2-5 characters)')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const metadata: PostMetadata = {
        title,
        tags,
        coverImage: coverImage ? await uploadFileToIPFS(coverImage) : null,
        nftMetadata: showNFTForm ? nftFormData : undefined,
        coinMetadata: showCoinForm ? coinFormData : undefined,
      }
      
      await onSave(content, metadata)
      
      // Reset form
      setTitle('')
      setContent('')
      setTags([])
      setCoverImage(null)
      setShowNFTForm(false)
      setShowCoinForm(false)
      setNftFormData({
        price: '0.01',
        royaltyBps: '500',
        coverImage: null,
        coverImagePreview: '',
        description: '',
      })
      setCoinFormData({
        name: '',
        symbol: '',
        mintFee: '0.000777',
        image: undefined,
        imagePreview: '',
      })
      
      toast.success('Post created successfully!')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write your title..."
            className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder-gray-400 dark:placeholder-gray-600"
          />
          
          {/* NFT Toggle */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleNFTToggle}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showNFTForm 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              disabled={isSubmitting}
            >
              <span className="mr-2">
                {showNFTForm ? '✓' : '✕'}
              </span>
              Mint as NFT
            </button>
            
            <button
              type="button"
              onClick={handleCoinToggle}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showCoinForm 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              disabled={isSubmitting}
            >
              <span className="mr-2">
                {showCoinForm ? '✓' : '✕'}
              </span>
              Create YourPost Coin
            </button>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {showNFTForm && (
                <NFTMintForm 
                  formData={nftFormData}
                  mintPrice={nftFormData.price}
                  onMintPriceChange={(price) => setNftFormData({...nftFormData, price})}
                  royaltyBps={nftFormData.royaltyBps}
                  onRoyaltyChange={(bps) => setNftFormData({...nftFormData, royaltyBps: bps})}
                  onCoverImageChange={(file) => {
                    setNftFormData({
                      ...nftFormData,
                      coverImage: file,
                      coverImagePreview: file ? URL.createObjectURL(file) : ''
                    })
                  }}
                  onDescriptionChange={(desc) => setNftFormData({...nftFormData, description: desc})}
                />
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {showCoinForm && (
                <CoinMintForm
                  formData={coinFormData}
                  onNameChange={(name) => updateCoinFormData({ name })}
                  onSymbolChange={(symbol) => updateCoinFormData({ symbol })}
                  onMintFeeChange={(fee) => updateCoinFormData({ mintFee: fee })}
                  onImageChange={(file) => {
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        updateCoinFormData({
                          image: file,
                          imagePreview: reader.result as string
                        })
                      }
                      reader.readAsDataURL(file)
                    } else {
                      updateCoinFormData({
                        image: undefined,
                        imagePreview: ''
                      })
                    }
                  }}
                  isSubmitting={isSubmitting}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Author Info and Word Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  {address?.slice(0, 1) || 'A'}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            <div className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full">
              {new Date().toLocaleDateString()}
            </div>
          </div>
          <div className="text-blue-600 dark:text-blue-400 font-medium">
            {content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length} words
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tags (press Enter)"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          />
        </div>

        {/* Rich Text Editor */}
        <div className="prose dark:prose-invert max-w-none">
          <style jsx global>{`
            .ql-toolbar {
              border: none !important;
              padding: 0.5rem 0 !important;
              border-bottom: 1px solid #e5e7eb !important; /* Light gray border */
              margin-bottom: 1rem !important;
            }
            .ql-toolbar .ql-formats {
              margin-right: 12px !important;
            }
            .ql-toolbar button {
              padding: 4px 8px !important;
              border-radius: 4px !important;
              transition: background-color 0.2s !important;
            }
            .ql-toolbar button:hover {
              background-color: #f3f4f6 !important; /* Light gray hover */
            }
            .dark .ql-toolbar button:hover {
              background-color: #374151 !important; /* Darker gray for dark mode */
            }
            .ql-toolbar button svg {
              width: 18px !important;
              height: 18px !important;
            }
            .ql-container {
              border: none !important;
              font-size: 1.125rem !important; /* text-lg */
              line-height: 1.75rem !important; /* leading-relaxed */
              min-height: 400px !important;
              padding: 0 !important;
            }
            .ql-editor {
              padding: 0 !important;
            }
            .ql-editor.ql-blank::before {
              color: #9ca3af !important; /* text-gray-400 */
              font-style: normal !important;
              left: 0 !important;
            }
          `}</style>
          <ReactQuill
            value={content}
            onChange={setContent}
            placeholder="Start writing your post..."
            className="min-h-[400px]"
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            }}
            theme="snow"
          />
        </div>

        {/* NFT Form is now handled in the header section */}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !title || !content}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Publishing...' : showNFTForm ? 'Publish as NFT' : 'Publish Post'}
          </button>
        </div>
      </form>
    </motion.div>
  )
} 