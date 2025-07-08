'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import UserRegistrationModal from './UserRegistrationModal'
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa'

export default function Header() {
  const { address } = useAccount()
  const pathname = usePathname()
  const [showRegistration, setShowRegistration] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    // The modal will handle the routing to profile page
  }

  const isActive = (path: string) => pathname === path

  // Don't render anything until after hydration
  if (!isMounted) {
    return null
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - Left side */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-base">YZ</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  YourZ
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Center */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center space-x-8">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors px-2 py-1 rounded-md ${
                    isActive('/')
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/marketplace"
                  className={`text-sm font-medium transition-colors px-2 py-1 rounded-md ${
                    isActive('/marketplace')
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/coins"
                  className={`text-sm font-medium transition-colors px-2 py-1 rounded-md ${
                    isActive('/coins')
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  Coins
                </Link>
                <Link
                  href="/trade"
                  className={`text-sm font-medium transition-colors px-2 py-1 rounded-md ${
                    isActive('/trade')
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  Trade
                </Link>
                <Link
                  href="/collections"
                  className={`text-sm font-medium transition-colors px-2 py-1 rounded-md ${
                    isActive('/collections')
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  Collections
                </Link>
                
                {/* Explore Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsExploreOpen(!isExploreOpen)}
                    className={`flex items-center text-sm font-medium transition-colors px-2 py-1 rounded-md ${
                      isExploreOpen
                        ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                    }`}
                  >
                    Explore
                    <FaChevronDown className={`ml-2 w-3 h-3 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isExploreOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700">
                      <div className="py-2" role="menu" aria-orientation="vertical">
                        <Link
                          href="/how-it-works"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          role="menuitem"
                          onClick={() => setIsExploreOpen(false)}
                        >
                          How It Works
                        </Link>
                        <Link
                          href="/how-to-earn"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          role="menuitem"
                          onClick={() => setIsExploreOpen(false)}
                        >
                          How to Earn
                        </Link>
                        <Link
                          href="/faqs"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          role="menuitem"
                          onClick={() => setIsExploreOpen(false)}
                        >
                          FAQs
                        </Link>
                        <Link
                          href="/tokenized-posts"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          role="menuitem"
                          onClick={() => setIsExploreOpen(false)}
                        >
                          Tokenized Posts
                        </Link>
                        <Link
                          href="/collaborative-writing"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          role="menuitem"
                          onClick={() => setIsExploreOpen(false)}
                        >
                          Collaborative Writing
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Profile link */}
              {address && isRegistered && (
                <Link
                  href={`/profile?address=${address}`}
                  className={`hidden md:block text-sm font-medium transition-colors px-2 py-1 rounded-md ${
                    pathname.includes('/profile')
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  Profile
                </Link>
              )}
              
              {/* Theme toggle */}
              <ThemeToggle />
              
              {/* Connect button */}
              <ConnectButton />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="space-y-2">
                <Link
                  href="/"
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/')
                      ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/marketplace"
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/marketplace')
                      ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Marketplace
                </Link>
                <Link
                  href="/coins"
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/coins')
                      ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Coins
                </Link>
                <Link
                  href="/trade"
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/trade')
                      ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Trade
                </Link>
                <Link
                  href="/collections"
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/collections')
                      ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Collections
                </Link>
                <Link
                  href="/write"
                  className="block px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Write
                </Link>
                {address && isRegistered && (
                  <Link
                    href={`/profile?address=${address}`}
                    className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pathname.includes('/profile')
                        ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                )}
              </div>
            </div>
          )}
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