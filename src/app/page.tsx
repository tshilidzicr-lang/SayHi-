'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { supabaseUser, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!supabaseUser) {
      router.replace('/auth')
    } else if (!profile?.name) {
      router.replace('/profile?setup=true')
    } else {
      router.replace('/discover')
    }
  }, [supabaseUser, profile, loading, router])

  return (
    <div className="h-screen flex items-center justify-center bg-coal-900">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl animate-pulse">🔥</div>
        <div className="text-coal-400 text-sm">Loading SayHi...</div>
      </div>
    </div>
  )
}
