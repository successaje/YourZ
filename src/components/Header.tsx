'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-100 border-b border-gray-100 dark:border-dark-200 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              YourZ
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/explore" className="nav-link">
                Explore
              </Link>
              <Link href="/collections" className="nav-link">
                Collections
              </Link>
              <Link href="/write" className="nav-link">
                Write
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  )
} 