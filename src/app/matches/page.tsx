'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Match, User } from '@/types'
import BottomNav from '@/components/ui/BottomNav'
import { MessageCircle, Heart } from 'lucide-react'

interface MatchWithUser extends Match { other_user: User }

export default function MatchesPage() {
  const { supabaseUser, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [matches, setMatches] = useState<MatchWithUser[]>([])
  const [fetchingMatches, setFetchingMatches] = useState(true)

  useEffect(() => { if (!loading && !supabaseUser) router.replace('/auth') }, [supabaseUser, loading, router])

  useEffect(() => {
    if (!supabaseUser) return
    const fetchMatches = async () => {
      setFetchingMatches(true)
      const { data } = await supabase.from('matches').select('*').or(`user1_id.eq.${supabaseUser.id},user2_id.eq.${supabaseUser.id}`).order('created_at', { ascending: false })
      const enriched = await Promise.all((data || []).map(async (match) => {
        const otherId = match.user1_id === supabaseUser.id ? match.user2_id : match.user1_id
        const { data: user } = await supabase.from('users').select('*').eq('id', otherId).single()
        return { ...match, other_user: user }
      }))
      setMatches(enriched.filter((m) => m.other_user) as MatchWithUser[])
      setFetchingMatches(false)
    }
    fetchMatches()
  }, [supabaseUser])

  return (
    <div className="h-screen flex flex-col bg-coal-900 overflow-hidden">
      <div className="flex-none px-5 pt-14 pb-4">
        <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Mono', monospace" }}>Matches <span className="ember-text">🔥</span></h1>
        <p className="text-coal-400 text-sm mt-1">{matches.length} {matches.length === 1 ? 'match' : 'matches'}</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollable px-4 pb-24">
        {fetchingMatches ? <div className="flex items-center justify-center h-40"><div className="text-3xl animate-pulse">💘</div></div>
        : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-white text-lg font-bold">No matches yet</h3>
            <Link href="/discover" className="mt-4 btn-ember px-6 py-3 rounded-xl text-white font-semibold text-sm">Discover People</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Link key={match.id} href={`/chat/${match.id}`} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="relative flex-none">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden" style={{ border: '2px solid rgba(255,77,51,0.4)' }}>
                    {match.other_user.photo_url ? <Image src={match.other_user.photo_url} alt={match.other_user.name} width={64} height={64} className="object-cover w-full h-full" /> : <div className="w-full h-full bg-coal-600 flex items-center justify-center text-2xl">👤</div>}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b50, #ff4d33)' }}><Heart className="w-3 h-3 text-white" fill="white" /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{match.other_user.name}</h3>
                  <p className="text-coal-400 text-sm truncate mt-0.5">{match.other_user.bio || 'Say hello! 👋'}</p>
                </div>
                <MessageCircle className="w-5 h-5 text-coal-400 flex-none" />
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
        }
