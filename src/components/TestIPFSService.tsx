'use client'

import { useState } from 'react'
import { uploadToIPFS, getFromIPFS } from '@/lib/ipfs'
import { toast } from 'react-hot-toast'

// Simple type for our test metadata
type TestMetadata = {
  name: string
  description: string
  image?: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

export default function TestIPFSService() {
  const [testData, setTestData] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const handleUploadTestJSON = async () => {
    try {
      // Create a simple test metadata object
      const metadata: TestMetadata = {
        name: 'Test NFT ' + Date.now(),
        description: 'This is a test NFT',
        image: 'ipfs://bafybeihj5z3b2g4d4q4z4y5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q5q',
        attributes: [
          {
            trait_type: 'Test',
            value: 'Test Value ' + Math.random().toString(36).substring(2, 8)
          }
        ]
      }
      
      console.group('Uploading Test JSON')
      console.log('Metadata:', metadata)

      console.log('Uploading JSON:', metadata)
      
      // Upload to IPFS
      const hash = await uploadToIPFS(metadata)
      
      console.log('Successfully uploaded to IPFS')
      console.log('IPFS Hash:', hash)
      console.groupEnd()
      
      setResult(hash)
      toast.success(`Successfully uploaded to IPFS: ${hash.substring(0, 12)}...`)
    } catch (error) {
      console.error('Error uploading:', error)
      if (error.response) {
        console.error('Error response data:', error.response.data)
        console.error('Error status:', error.response.status)
        console.error('Error headers:', error.response.headers)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Error message:', error.message)
      }
      toast.error(error.response?.data?.error?.details || error.message || 'Failed to upload')
      console.groupEnd()
    }
  }

  const handleUploadFile = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    try {
      console.log('Uploading file:', file.name)
      
      // Upload to IPFS
      const hash = await uploadToIPFS(file)
      
      console.log('Successfully uploaded file:', hash)
      setResult(hash)
      
      toast.success('Successfully uploaded file to IPFS')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">IPFS Test Service</h2>
      
      <div className="space-y-4">
        {/* JSON Upload Test */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Test JSON Upload</h3>
          <button
            onClick={handleUploadTestJSON}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Upload Test JSON
          </button>
        </div>

        {/* File Upload Test */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Test File Upload</h3>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button
              onClick={handleUploadFile}
              disabled={!file}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Upload Selected File
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Result</h3>
            <div className="text-sm">
              <p className="mb-2">IPFS Hash: {result}</p>
              <p>IPFS URL: https://ipfs.io/ipfs/{result}</p>
              <p>Pinata URL: https://olive-foreign-tuna-244.mypinata.cloud/ipfs/{result}</p>
              <button
                onClick={async () => {
                  try {
                    const content = await getFromIPFS(result);
                    toast.success('Successfully fetched content');
                    console.log('Fetched content:', content);
                  } catch (error) {
                    console.error('Error fetching content:', error);
                    toast.error('Failed to fetch content');
                  }
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Verify Content
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
