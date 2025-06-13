'use client'

import { useEffect, useState } from 'react'

interface PlaceholderAvatarProps {
  name?: string
  size?: number
  className?: string
  address?: string
}

export function PlaceholderAvatar({ name = 'Anonymous', size = 40, className = '', address }: PlaceholderAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    console.log('PlaceholderAvatar useEffect triggered with:', {
      address,
      name,
      currentAvatarUrl: avatarUrl,
      hasError: error
    })

    if (!address) {
      console.log('No address provided, falling back to initials')
      return
    }

    // Generate a seed from the address (last 8 characters)
    const seed = address.slice(-8)
    console.log('Generating avatar with seed:', seed)

    // List of non-gendered avatar styles
    const styles = [
      'bottts',      // Robot avatars
      'identicon',   // Abstract geometric patterns
      'pixel-art',   // Pixel art style
      'shapes',      // Abstract shapes
      'gridy',       // Grid-based patterns
      'miniavs',     // Minimalist avatars
      'micah',       // Abstract faces
      'avataaars-neutral' // Neutral version of avataaars
    ]

    // Use the first character of the address to consistently pick a style
    const styleIndex = parseInt(seed[0], 16) % styles.length
    const style = styles[styleIndex]
    console.log('Selected avatar style:', style, 'from index:', styleIndex)

    // Construct the avatar URL with neutral options
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=random&radius=50`
    console.log('Generated avatar URL:', url)
    setAvatarUrl(url)
  }, [address])

  // Get initials from name
  const getInitials = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    console.log('Generated initials:', initials, 'from name:', name)
    return initials
  }

  if (error || !avatarUrl) {
    console.log('Rendering initials fallback because:', {
      hasError: error,
      hasAvatarUrl: !!avatarUrl
    })
    
    // Generate a consistent color based on the name
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    const hue = hash % 360
    const gradient = `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${(hue + 30) % 360}, 70%, 50%))`

    return (
      <div
        className="flex items-center justify-center rounded-full font-medium text-white shadow-md"
        style={{
          width: size,
          height: size,
          background: gradient,
          fontSize: `${size * 0.4}px`,
        }}
      >
        {getInitials(name)}
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Failed to load avatar image:', {
            url: avatarUrl,
            error: e
          })
          setError(true)
        }}
      />
    </div>
  )
} 