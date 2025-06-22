'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useZoraMint } from '../hooks/useZoraMint';

export function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { address } = useAccount();
  const { mintNFT } = useZoraMint();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setIsMinting(true);
      setError('');
      setSuccess('');

      // Create metadata for the post
      const metadata = {
        name: title,
        description: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
        content: content,
        type: 'yourz-post',
        createdAt: new Date().toISOString()
      };

      // Mint the NFT with the post content
      const result = await mintNFT({
        tokenURI: JSON.stringify(metadata),
        recipient: address,
        quantity: 1,
      });

      if (result.success) {
        setSuccess('Post created and minted as NFT successfully!');
        setTitle('');
        setContent('');
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('An error occurred while creating the post');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create a New Post</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Post title"
            disabled={isMinting}
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What's on your mind?"
            disabled={isMinting}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isMinting}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isMinting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isMinting ? 'Minting...' : 'Create Post & Mint NFT'}
          </button>
        </div>
      </form>
    </div>
  );
}
