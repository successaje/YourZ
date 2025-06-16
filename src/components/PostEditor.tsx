'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useZora } from '@/hooks/useZora'
import { uploadToIPFS, uploadFileToIPFS } from '@/lib/ipfs'
import type { PostMetadata } from '@/types/post'
import { toast } from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface PostEditorProps {
  onSave: (content: string, metadata: PostMetadata) => Promise<void>
  onWordCountChange?: (count: number) => void
  showNFTForm?: boolean
  setShowNFTForm?: (show: boolean) => void
  isLoading?: boolean
}

export default function PostEditor({ 
  onSave, 
  onWordCountChange, 
  showNFTForm = false,
  setShowNFTForm,
  isLoading = false
}: PostEditorProps) {
  const router = useRouter()
  const { address } = useAccount()
  const { mintPost } = useZora()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [mintPrice, setMintPrice] = useState('0.01')
  const [royaltyBps, setRoyaltyBps] = useState('500') // 5%
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
    onDrop: async (acceptedFiles) => {
      try {
        const file = acceptedFiles[0];
        if (file) {
          setCoverImage(file);
          // Create a preview URL
          const previewUrl = URL.createObjectURL(file);
          setCoverImagePreview(previewUrl);
        }
      } catch (error) {
        console.error('Error handling file drop:', error);
        toast.error('Failed to process image');
      }
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 5MB');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload an image');
      } else {
        toast.error('Error uploading file');
      }
    }
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting handleSubmit in PostEditor');
    
    // Validate required fields
    if (!title.trim()) {
      console.log('Title validation failed');
      toast.error('Please enter a title');
      return;
    }
    if (!content.trim()) {
      console.log('Content validation failed');
      toast.error('Please enter some content');
      return;
    }
    if (showNFTForm) {
      if (!mintPrice || Number(mintPrice) <= 0) {
        console.log('Mint price validation failed:', mintPrice);
        toast.error('Please enter a valid mint price');
        return;
      }
      if (!royaltyBps || Number(royaltyBps) < 0 || Number(royaltyBps) > 1000) {
        console.log('Royalty validation failed:', royaltyBps);
        toast.error('Royalty must be between 0% and 10%');
        return;
      }
    }
    console.log('All validations passed');

    try {
      let coverImageHash = null;
      if (showNFTForm && coverImage) {
        try {
          console.log('Starting cover image upload to IPFS');
          coverImageHash = await uploadFileToIPFS(coverImage);
          console.log('Cover image uploaded successfully, hash:', coverImageHash);
        } catch (error) {
          console.error('Error uploading cover image:', error);
          toast.error('Failed to upload cover image. Please try again.');
          return;
        }
      }

      const metadata = {
        title,
        content,
        author: address,
        createdAt: new Date().toISOString(),
        ...(showNFTForm && {
          mintPrice,
          royaltyBps,
          coverImage: coverImageHash,
        }),
      };
      console.log('Prepared metadata for save:', metadata);

      console.log('Calling onSave with content and metadata');
      await onSave(content, metadata);
      console.log('onSave completed successfully');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
      toast.error('An unexpected error occurred. Please try again.');
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
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Write your title..."
          className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder-gray-400 dark:placeholder-gray-600"
        />

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

        {/* NFT Form */}
        {showNFTForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              NFT Settings
            </h3>
            
            {/* Cover Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cover Image
              </label>
              <div className="relative w-48 h-32 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                {coverImagePreview ? (
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <label className="cursor-pointer text-center p-2">
                      <input
                        type="file"
                        accept="image/*"
                        {...getRootProps()}
                        className="hidden"
                      />
                      <div className="text-gray-500 dark:text-gray-400">
                        <svg
                          className="mx-auto h-8 w-8"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="mt-1 text-xs">Upload cover</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Mint Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mint Price (ETH)
                </label>
                <input
                  type="number"
                  value={mintPrice}
                  onChange={(e) => setMintPrice(e.target.value)}
                  step="0.001"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Royalty (basis points)
                </label>
                <input
                  type="number"
                  value={royaltyBps}
                  onChange={(e) => setRoyaltyBps(e.target.value)}
                  min="0"
                  max="10000"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>
        )}

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