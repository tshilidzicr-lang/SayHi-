'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import BottomNav from '@/components/ui/BottomNav'
import { MessageCircle, Heart } from 'lucide-react'

interface OtherUser {
  id: string
  name: string
  bio: string | null
  photo_url: string | null
}

interface MatchItem {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  other_user: OtherUser
}

export default function MatchesPage() {
  const { supabaseUser, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [fetchingMatches, setFetchingMatches] = useState(true)

  useEffect(() => {
    if (!loading && !supabaseUser) router.replace('/auth')
  }, [supabaseUser, loading, router])

  useEffect(() => {
    if (!supabaseUser) return
    const uid = (supabaseUser as {id: string}).id
    const fetchMatches = async () => {
      setFetchingMatches(true)
      const { data } = await supabase
        .from('matches').select('*')
        .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
        .order('created_at', { ascending: false })
      const enriched = await Promise.all((data || []).map(async (match: {id: string; user1_id: string; user2_id: string; created_at: string}) => {
        const otherId = match.user1_id === uid ? match.user2_id : match.user1_id
        const { data: user } = await supabase.from('users').select('*').eq('id', otherId).single()
        return { ...match, other_user: user }
      }))
      setMatches(enriched.filter((m) => m.other_user) as MatchItem[])
      setFetchingMatches(false)
    }
    fetchMatches()
  }, [supabaseUser])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0b', color: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '56px 20px 16px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>Matches 🔥</h1>
        <p style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 96px' }}>
        {fetchingMatches ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ fontSize: 32 }}>💘</div>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💔</div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>No matches yet</h3>
            <Link href="/discover" style={{ marginTop: 16, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #ff6b50, #ff4d33)', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Discover People</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {matches.map((match) => (
              <Link key={match.id} href={`/chat/${match.id}`} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', color: '#fff' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(255,77,51,0.4)', background: '#222' }}>
                    {match.other_user.photo_url
                      ? <Image src={match.other_user.photo_url} alt={match.other_user.name} width={64} height={64} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
                    }
                  </div>
                  <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b50, #ff4d33)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={10} color="#fff" fill="#fff" />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.other_user.name}</h3>
                  <p style={{ color: '#666', fontSize: 14, margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.other_user.bio || 'Say hello! 👋'}</p>
                </div>
                <MessageCircle size={20} color="#666" />
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
