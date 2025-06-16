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
  const { mintNFT, isMinting } = useZoraMinter()
  
  // NFT Form state
  const [nftFormData, setNftFormData] = useState<NFTFormData>({
    price: '0.01',
    royaltyBps: '500', // 5%
    coverImage: null,
    coverImagePreview: '',
    description: '',
  })
  const router = useRouter()
  const { address } = useAccount()
  const { createNFT } = useZora()
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')
  const [mintPrice, setMintPrice] = useState('0.01')
  const [royaltyBps, setRoyaltyBps] = useState('500') // 5% default royalty

  const handleNftFormChange = (data: NFTFormData) => {
    setNftFormData(data);
  };
  
  const toggleNFTForm = () => {
    setShowNFTForm(!showNFTForm);
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  // Calculate word count
  useEffect(() => {
    const count = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length
    onWordCountChange?.(count)
  }, [content, onWordCountChange])

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
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let coverImageUrl = '';
      
      // Upload cover image if it exists
      if (coverImage) {
        coverImageUrl = await uploadFileToIPFS(coverImage);
      }
      
      // Prepare post metadata
      const postMetadata: PostMetadata = {
        title,
        content,
        author: { 
          address: address || '', 
          name: 'Anonymous' 
        },
        createdAt: new Date(),
        mintPrice: 0, // Default to 0, will be updated if NFT is minted
        royaltyBps: 0, // Default to 0, will be updated if NFT is minted
        coverImage: coverImageUrl || '',
        tags,
        nftMetadata: {},
        is_nft: false // Explicitly set to false by default
      };
      
      // If minting as NFT
      if (showNFTForm) {
        try {
          const nftResult = await mintNFT({
            title,
            description: nftFormData.description || `${title} - Published on YourZ`,
            content,
            coverImage: nftFormData.coverImage,
            price: nftFormData.price,
            royaltyBps: nftFormData.royaltyBps,
          });
          
          // Add NFT metadata to post metadata
          postMetadata.nftMetadata = {
            tokenId: nftResult.tokenId || '',
            contractAddress: nftResult.tokenAddress || '',
            txHash: nftResult.txHash || '',
            price: nftFormData.price,
            royaltyBps: nftFormData.royaltyBps,
            metadataHash: nftResult.metadataHash || '',
            contentHash: nftResult.contentHash || '',
            imageHash: nftResult.imageHash || '',
          };
          
          // Update post metadata for NFT
          postMetadata.is_nft = true;
          postMetadata.mintPrice = parseFloat(nftFormData.price) || 0;
          postMetadata.royaltyBps = parseInt(nftFormData.royaltyBps) || 0;
          
          // Set the cover image from NFT metadata if available
          if (nftResult.imageHash) {
            postMetadata.coverImage = `ipfs://${nftResult.imageHash}`;
          }
          
        } catch (error) {
          console.error('Failed to mint NFT:', error);
          toast.error('Failed to mint NFT. Please try again.');
          return;
        }
      }
      
      // Save the post with metadata
      await onSave(content, postMetadata);
      
    } catch (error) {
      console.error('Error saving post:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to publish: ${errorMessage}`);
      throw error;
    } finally {
      setIsSubmitting(false);
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
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleNFTForm}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showNFTForm 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">
                  {showNFTForm ? '✓' : '✕'}
                </span>
                Mint as NFT
              </button>
              {showNFTForm && (
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                  Your post will be minted as an NFT on the Zora Network
                </span>
              )}
            </div>
          </div>
          
          {/* NFT Form */}
          <AnimatePresence>
            {showNFTForm && (
              <div className="mt-6">
                <NFTMintForm 
                  formData={nftFormData}
                  mintPrice={mintPrice}
                  onMintPriceChange={(price) => {
                    setMintPrice(price);
                    setNftFormData(prev => ({ ...prev, price }));
                  }}
                  royaltyBps={royaltyBps}
                  onRoyaltyChange={(bps) => {
                    setRoyaltyBps(bps);
                    setNftFormData(prev => ({ ...prev, royaltyBps: bps }));
                  }}
                  onCoverImageChange={(file) => setNftFormData(prev => ({ ...prev, coverImage: file }))}
                  onDescriptionChange={(description) => setNftFormData(prev => ({ ...prev, description }))}
                />
              </div>
            )}
          </AnimatePresence>
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