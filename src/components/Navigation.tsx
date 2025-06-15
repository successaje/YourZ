'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaChevronDown } from 'react-icons/fa'

export default function Navigation() {
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">YourZ</span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium ${
                isActive('/') ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Home
            </Link>

            {/* Learn More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLearnMoreOpen(!isLearnMoreOpen)}
                className={`flex items-center text-sm font-medium ${
                  isLearnMoreOpen ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                Learn More
                <FaChevronDown className={`ml-1 w-4 h-4 transition-transform ${isLearnMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLearnMoreOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
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
              href="/write"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Write
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 