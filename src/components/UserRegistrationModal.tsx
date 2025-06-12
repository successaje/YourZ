'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useUserRegistration } from '@/hooks/useUserRegistration'

interface UserRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UserRegistrationModal({ isOpen, onClose, onSuccess }: UserRegistrationModalProps) {
  const { address } = useAccount()
  const { registerUser, isRegistering, error } = useUserRegistration()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [usernameError, setUsernameError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameError('')

    if (!username.trim()) {
      setUsernameError('Username is required')
      return
    }

    if (!address) {
      setUsernameError('Wallet not connected')
      return
    }

    try {
      await registerUser({
        address,
        username: username.trim(),
        email: email.trim() || undefined
      })
      onSuccess()
    } catch (err) {
      if (err instanceof Error) {
        setUsernameError(err.message)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-dark-100 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Complete Your Profile</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose a unique username to get started. You can add your email later for notifications.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username *
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-200 dark:text-white"
              placeholder="Choose a unique username"
              required
            />
            {usernameError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{usernameError}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-200 dark:text-white"
              placeholder="your@email.com"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRegistering}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 