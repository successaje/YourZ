import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Header from '../components/Header'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import { Space_Grotesk } from 'next/font/google'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata = {
  title: 'YourZ - Tokenize Your Words, Own Your Influence',
  description: 'A next-generation blogging platform built on Zora Protocol, where every post becomes a collectible NFT.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.className} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-dark-100 transition-colors duration-200">
        <Providers>
          <Navigation />
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark-100">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 mt-16">
              {children}
            </main>
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
} 