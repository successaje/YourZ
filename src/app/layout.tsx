import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Header from '../components/Header'
import { Toaster } from 'react-hot-toast'
import { Space_Grotesk } from 'next/font/google'
import Navigation from '@/components/Navigation'
import { ThemeProvider } from 'next-themes'

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
      <head />
      <body className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <Header />
              {children}
            </div>
            <Toaster position="top-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
} 