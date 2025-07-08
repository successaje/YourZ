'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useUserRegistration } from '@/hooks/useUserRegistration'
import { toast } from 'react-hot-toast'
import { FaSpinner, FaCheck, FaUser } from 'react-icons/fa'

interface UserRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UserRegistrationModal({ isOpen, onClose, onSuccess }: UserRegistrationModalProps) {
  const { address } = useAccount()
  const router = useRouter()
  const { registerUser, isRegistering, error } = useUserRegistration()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('Modal state - isRegistering:', isRegistering, 'isSuccess:', isSuccess, 'error:', error)
  }, [isRegistering, isSuccess, error])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameError('')
    console.log('Form submitted, starting registration...')

    if (!username.trim()) {
      setUsernameError('Username is required')
      return
    }

    if (!address) {
      setUsernameError('Wallet not connected')
      return
    }

    try {
      console.log('Showing loading toast...')
      // Show loading toast
      const loadingToast = toast.loading('Creating your profile...', {
        icon: <FaSpinner className="animate-spin" />,
      })

      console.log('Calling registerUser...')
      await registerUser({
        address,
        username: username.trim(),
        email: email.trim() || undefined
      })

      console.log('Registration successful, showing success toast...')
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success('Profile created successfully!', {
        icon: <FaCheck className="text-green-500" />,
        duration: 3000,
      })

      console.log('Setting success state...')
      setIsSuccess(true)
      
      // Wait a moment for user to see success message, then redirect
      setTimeout(() => {
        console.log('Redirecting to profile page...')
        onSuccess()
        router.push(`/profile?address=${address}`)
      }, 1500)

    } catch (err) {
      console.error('Registration failed:', err)
      // Dismiss any loading toast
      toast.dismiss()
      
      if (err instanceof Error) {
        setUsernameError(err.message)
        toast.error(err.message, {
          duration: 4000,
        })
      } else {
        setUsernameError('Failed to create profile')
        toast.error('Failed to create profile', {
          duration: 4000,
        })
      }
    }
  }

  const handleClose = () => {
    if (!isRegistering) {
      setUsername('')
      setEmail('')
      setUsernameError('')
      setIsSuccess(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        {isSuccess ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <FaCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Profile Created!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your profile has been successfully created. Redirecting you to your profile page...
            </p>
            <div className="flex justify-center">
              <FaSpinner className="h-6 w-6 text-purple-500 animate-spin" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-4">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900">
                <FaUser className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">Complete Your Profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
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
                  disabled={isRegistering}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  disabled={isRegistering}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isRegistering}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegistering || !username.trim()}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {isRegistering ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Profile</span>
                  )}
                </button>
              </div>
            </form>
            
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <p>Debug: isRegistering={isRegistering.toString()}</p>
                <p>Debug: error={error || 'none'}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 