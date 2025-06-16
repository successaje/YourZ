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
  const [isMounted, setIsMounted] = useState(false)
  const [isExploreOpen, setIsExploreOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.dropdown-container')
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsExploreOpen(false)
      }
    }

    if (isExploreOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExploreOpen])

  const handleRegistrationSuccess = () => {
    setShowRegistration(false)
    setIsRegistered(true)
  }

  // Don't render anything until after hydration
  if (!isMounted) {
    return null
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
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setIsExploreOpen(!isExploreOpen)}
                    className={`text-sm font-medium ${
                      isExploreOpen
                        ? 'text-primary-500'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    Explore
                  </button>
                  {isExploreOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link
                          href="/how-it-works"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          How It Works
                        </Link>
                        <Link
                          href="/how-to-earn"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          How to Earn
                        </Link>
                        <Link
                          href="/faqs"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          FAQs
                        </Link>
                        <Link
                          href="/tokenized-posts"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          Tokenized Posts
                        </Link>
                        <Link
                          href="/collaborative-writing"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          Collaborative Writing
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
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
                  href={`/profile?address=${address}`}
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