'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { User } from '@/types'
import SwipeCard from '@/components/swipe/SwipeCard'
import MatchModal from '@/components/swipe/MatchModal'
import BottomNav from '@/components/ui/BottomNav'
import { X, Heart, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DiscoverPage() {
  const { supabaseUser, profile, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [candidates, setCandidates] = useState<User[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fetchingUsers, setFetchingUsers] = useState(true)
  const [matchModal, setMatchModal] = useState<{ matchId: string; matchedUser: User } | null>(null)

  useEffect(() => {
    if (!loading && !supabaseUser) router.replace('/auth')
    if (!loading && supabaseUser && !profile?.name) router.replace('/profile?setup=true')
  }, [supabaseUser, profile, loading, router])

  const fetchCandidates = useCallback(async () => {
    if (!supabaseUser) return
    setFetchingUsers(true)
    try {
      const { data: liked } = await supabase.from('likes').select('to_user_id').eq('from_user_id', supabaseUser.id)
      const excludeIds = [supabaseUser.id, ...(liked?.map((l) => l.to_user_id) || [])]
      const { data: users } = await supabase.from('users').select('*').not('id', 'in', `(${excludeIds.join(',')})`).not('name', 'is', null).limit(20)
      setCandidates(users || [])
      setCurrentIndex(0)
    } catch (err) { console.error(err) }
    finally { setFetchingUsers(false) }
  }, [supabaseUser])

  useEffect(() => {
    if (supabaseUser && profile?.name) fetchCandidates()
  }, [supabaseUser, profile, fetchCandidates])

  const handleLike = async (targetUser: User) => {
    if (!supabaseUser || !profile) return
    try {
      await supabase.from('likes').insert({ from_user_id: supabaseUser.id, to_user_id: targetUser.id })
      const { data: mutualLike } = await supabase.from('likes').select('id').eq('from_user_id', targetUser.id).eq('to_user_id', supabaseUser.id).maybeSingle()
      if (mutualLike) {
        const { data: match } = await supabase.from('matches').insert({ user1_id: supabaseUser.id, user2_id: targetUser.id }).select().single()
        if (match) setMatchModal({ matchId: match.id, matchedUser: targetUser })
      }
      setCurrentIndex((prev) => prev + 1)
    } catch (err) { console.error(err); toast.error('Something went wrong') }
  }

  const currentUser = candidates[currentIndex]
  const nextUser = candidates[currentIndex + 1]

  return (
    <div className="h-screen flex flex-col bg-coal-900 overflow-hidden">
      <div className="flex-none flex items-center justify-between px-5 pt-14 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-black ember-text" style={{ fontFamily: "'Space Mono', monospace" }}>SayHi</span>
        </div>
      </div>
      <div className="flex-1 relative px-4 pb-4 overflow-hidden">
        {fetchingUsers ? (
          <div className="h-full flex flex-col items-center justify-center gap-4"><div className="text-4xl animate-pulse">🔥</div><p className="text-coal-400 text-sm">Finding people near you...</p></div>
        ) : !currentUser ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="text-6xl mb-2">😮‍💨</div>
            <h3 className="text-white text-xl font-bold">You've seen everyone!</h3>
            <button onClick={fetchCandidates} className="btn-ember px-6 py-3 rounded-xl text-white font-semibold text-sm mt-2">Refresh</button>
          </div>
        ) : (
          <div className="relative h-full">
            {nextUser && <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ transform: 'scale(0.94) translateY(16px)', zIndex: 5 }}><SwipeCard key={`next-${nextUser.id}`} user={nextUser} onLike={() => {}} onPass={() => {}} isTop={false} /></div>}
            <SwipeCard key={`top-${currentUser.id}`} user={currentUser} onLike={() => handleLike(currentUser)} onPass={() => setCurrentIndex((prev) => prev + 1)} isTop={true} />
          </div>
        )}
      </div>
      {currentUser && !fetchingUsers && (
        <div className="flex-none flex items-center justify-center gap-5 pb-24 px-4">
          <button onClick={() => setCurrentIndex((prev) => prev + 1)} className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.1)' }}><X className="w-7 h-7 text-white/60" strokeWidth={2.5} /></button>
          <button onClick={() => { toast('⚡ Super Liked!'); handleLike(currentUser) }} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,179,237,0.1)', border: '2px solid rgba(99,179,237,0.3)' }}><Zap className="w-5 h-5 text-blue-300" fill="currentColor" /></button>
          <button onClick={() => handleLike(currentUser)} className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b50, #ff4d33)', boxShadow: '0 4px 24px rgba(255,77,51,0.5)' }}><Heart className="w-7 h-7 text-white" fill="white" /></button>
        </div>
      )}
      {matchModal && profile && <MatchModal currentUser={profile} matchedUser={matchModal.matchedUser} matchId={matchModal.matchId} onClose={() => setMatchModal(null)} />}
      <BottomNav />
    </div>
  )
  }
