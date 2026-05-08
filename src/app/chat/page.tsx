'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import BottomNav from '@/components/ui/BottomNav'
import { MessageCircle } from 'lucide-react'

export default function ChatListPage() {
  const { supabaseUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => { if (!loading && !supabaseUser) router.replace('/auth') }, [supabaseUser, loading, router])

  return (
    <div className="h-screen flex flex-col bg-coal-900 overflow-hidden">
      <div className="flex-none px-5 pt-14 pb-4">
        <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Mono', monospace" }}>Messages</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pb-24">
        <MessageCircle className="w-16 h-16 text-coal-500 mb-4" />
        <h3 className="text-white text-lg font-bold">Your conversations</h3>
        <p className="text-coal-400 text-sm mt-2">Go to your Matches to start chatting.</p>
        <Link href="/matches" className="mt-6 btn-ember px-6 py-3 rounded-xl text-white font-semibold text-sm">View Matches</Link>
      </div>
      <BottomNav />
    </div>
  )
}
