'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import UserRegistrationModal from './UserRegistrationModal'

export default function Header() {
  const { address } = useAccount()
  const pathname = usePathname()
  const [showRegistration, setShowRegistration] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    const checkUserRegistration = async () => {
      if (address) {
        try {
          const response = await fetch(`/api/users/check-registration?address=${address}`)
          const { isRegistered } = await response.json()
          setIsRegistered(isRegistered)
          
          if (!isRegistered) {
            setShowRegistration(true)
          }
        } catch (error) {
          console.error('Error checking user registration:', error)
        }
      }
    }

    checkUserRegistration()
  }, [address])

  const handleRegistrationSuccess = () => {
    setShowRegistration(false)
    setIsRegistered(true)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                YourZ
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/"
                  className={`text-sm font-medium ${
                    pathname === '/'
                      ? 'text-primary-500'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/explore"
                  className={`text-sm font-medium ${
                    pathname === '/explore'
                      ? 'text-primary-500'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Explore
                </Link>
                <Link
                  href="/collections"
                  className={`text-sm font-medium ${
                    pathname === '/collections'
                      ? 'text-primary-500'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Collections
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {address && isRegistered && (
                <Link
                  href="/profile"
                  className={`text-sm font-medium ${
                    pathname === '/profile'
                      ? 'text-primary-500'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Profile
                </Link>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <UserRegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </>
  )
} 