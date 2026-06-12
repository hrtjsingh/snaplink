'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'

export function ClerkUserIdLogger() {
  const { userId, isLoaded } = useAuth()

  useEffect(() => {
    if (!isLoaded || !userId) return
    console.log('[Snaplink] Clerk user ID:', userId)
  }, [isLoaded, userId])

  return null
}
