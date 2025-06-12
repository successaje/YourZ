'use client'

import { useMemo } from 'react'

interface PlaceholderAvatarProps {
  name: string
  size?: number
  className?: string
}

export default function PlaceholderAvatar({ name, size = 40, className = '' }: PlaceholderAvatarProps) {
  const initials = useMemo(() => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [name])

  const colors = [
    'bg-primary-500',
    'bg-accent-500',
    'bg-secondary-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
  ]

  const colorIndex = useMemo(() => {
    return name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  }, [name])

  return (
    <div
      className={`${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-medium ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  )
} 