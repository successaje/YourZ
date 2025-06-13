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
import { useUserProfile } from '@/hooks/useUserProfile'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface PostEditorProps {
  onSave: (metadata: PostMetadata, content: string) => Promise<void>
  onWordCountChange?: (count: number) => void
  showNFTForm?: boolean
}

export default function PostEditor({ onSave, onWordCountChange, showNFTForm = false }: PostEditorProps) {
  const router = useRouter()
  const { address } = useAccount()
  const { profile, isLoading: isLoadingProfile } = useUserProfile(address)
  const { mintPost } = useZora()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setCoverImage(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

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
    if (showNFTForm) {
      if (!mintPrice || Number(mintPrice) <= 0) {
        toast.error('Please enter a valid mint price');
        return;
      }
      if (!royaltyBps || Number(royaltyBps) < 0 || Number(royaltyBps) > 1000) {
        toast.error('Royalty must be between 0% and 10%');
        return;
      }
    }

    setIsLoading(true);
    try {
      let coverImageHash = null;
      if (showNFTForm && coverImage) {
        try {
          coverImageHash = await uploadFileToIPFS(coverImage);
        } catch (error) {
          console.error('Error uploading cover image:', error);
          toast.error('Failed to upload cover image. Please try again.');
          setIsLoading(false);
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

      let metadataURI;
      try {
        metadataURI = await uploadToIPFS(metadata);
      } catch (error) {
        console.error('Error uploading metadata:', error);
        toast.error('Failed to upload post metadata. Please try again.');
        setIsLoading(false);
        return;
      }

      if (showNFTForm) {
        try {
          const { createNFT } = useZora();
          const request = await createNFT({
            name: title,
            symbol: 'POST',
            royaltyBps: Number(royaltyBps),
            tokenURI: metadataURI,
            mintPrice: mintPrice.toString(),
          });

          const hash = await request.write();
          toast.success('Post published as NFT!');
          onSave({ ...metadata, nftHash: hash });
        } catch (error) {
          console.error('Error creating NFT:', error);
          toast.error('Failed to create NFT. Please try again.');
          setIsLoading(false);
          return;
        }
      } else {
        onSave(metadata);
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
                {isLoadingProfile ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {profile?.username?.[0] || 'A'}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isLoadingProfile ? (
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  profile?.username || 'Anonymous'
                )}
              </span>
            </div>
            <div className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full">
              {address?.slice(0, 6)}...{address?.slice(-4)}
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

        {/* Cover Image Upload */}
        {showNFTForm && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Uploading image...</p>
                  </div>
                ) : coverImage ? (
                  <div className="relative">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="mx-auto h-32 w-auto object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="cover-image"
                        className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="cover-image"
                          name="cover-image"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isLoading}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rich Text Editor */}
        <div className="prose dark:prose-invert max-w-none">
          <style jsx global>{`
            .ql-toolbar {
              border: none !important;
              padding: 0 !important;
              margin-bottom: 1rem !important;
              background: transparent !important;
              border-bottom: 1px solid #e5e7eb !important;
              padding-bottom: 0.75rem !important;
            }
            .dark .ql-toolbar {
              border-bottom-color: #374151 !important;
            }
            .ql-container {
              border: none !important;
              font-size: 1.125rem !important;
              line-height: 1.75 !important;
              margin-top: 1rem !important;
            }
            .ql-editor {
              padding: 0 !important;
              min-height: 400px !important;
            }
            .ql-editor p {
              margin-bottom: 1.5rem !important;
            }
            .ql-editor h1, .ql-editor h2, .ql-editor h3 {
              margin-top: 2rem !important;
              margin-bottom: 1rem !important;
            }
            .ql-editor ul, .ql-editor ol {
              margin-bottom: 1.5rem !important;
            }
            .ql-editor blockquote {
              border-left: 4px solid #e5e7eb !important;
              padding-left: 1rem !important;
              margin: 1.5rem 0 !important;
              color: #6b7280 !important;
            }
            .ql-editor a {
              color: #2563eb !important;
              text-decoration: underline !important;
            }
            .ql-editor img {
              margin: 1.5rem 0 !important;
              border-radius: 0.5rem !important;
            }
            .ql-editor pre {
              background: #f3f4f6 !important;
              padding: 1rem !important;
              border-radius: 0.5rem !important;
              margin: 1.5rem 0 !important;
            }
            .ql-editor code {
              background: #f3f4f6 !important;
              padding: 0.2rem 0.4rem !important;
              border-radius: 0.25rem !important;
              font-size: 0.875em !important;
            }
            .ql-editor.ql-blank::before {
              color: #9ca3af !important;
              font-style: normal !important;
            }
            .ql-toolbar button {
              color: #4b5563 !important;
            }
            .ql-toolbar button:hover {
              color: #2563eb !important;
            }
            .ql-toolbar button.ql-active {
              color: #2563eb !important;
            }
            .ql-toolbar .ql-stroke {
              stroke: currentColor !important;
            }
            .ql-toolbar .ql-fill {
              fill: currentColor !important;
            }
            .ql-toolbar .ql-picker {
              color: #4b5563 !important;
            }
            .ql-toolbar .ql-picker-options {
              background-color: white !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 0.5rem !important;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
            }
            .ql-toolbar .ql-picker-item {
              color: #4b5563 !important;
            }
            .ql-toolbar .ql-picker-item.ql-selected {
              color: #2563eb !important;
            }
            .ql-toolbar .ql-picker-item:hover {
              color: #2563eb !important;
            }
            .dark .ql-editor blockquote {
              border-left-color: #374151 !important;
              color: #9ca3af !important;
            }
            .dark .ql-editor a {
              color: #60a5fa !important;
            }
            .dark .ql-editor pre {
              background: #1f2937 !important;
            }
            .dark .ql-editor code {
              background: #1f2937 !important;
            }
            .dark .ql-toolbar button {
              color: #9ca3af !important;
            }
            .dark .ql-toolbar button:hover {
              color: #60a5fa !important;
            }
            .dark .ql-toolbar button.ql-active {
              color: #60a5fa !important;
            }
            .dark .ql-toolbar .ql-picker {
              color: #9ca3af !important;
            }
            .dark .ql-toolbar .ql-picker-options {
              background-color: #1f2937 !important;
              border-color: #374151 !important;
            }
            .dark .ql-toolbar .ql-picker-item {
              color: #9ca3af !important;
            }
            .dark .ql-toolbar .ql-picker-item.ql-selected {
              color: #60a5fa !important;
            }
            .dark .ql-toolbar .ql-picker-item:hover {
              color: #60a5fa !important;
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