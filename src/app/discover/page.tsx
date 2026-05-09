'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import BottomNav from '@/components/ui/BottomNav'
import { X, Heart, Zap } from 'lucide-react'
import Image from 'next/image'

interface UserProfile {
  id: string
  name: string
  bio: string | null
  age: number | null
  photo_url: string | null
}

export default function DiscoverPage() {
  const { supabaseUser, profile, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [candidates, setCandidates] = useState<UserProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fetchingUsers, setFetchingUsers] = useState(true)
  const [matchMsg, setMatchMsg] = useState('')

  useEffect(() => {
    if (!loading && !supabaseUser) router.replace('/auth')
    if (!loading && supabaseUser && !(profile as {name?:string})?.name) router.replace('/profile?setup=true')
  }, [supabaseUser, profile, loading, router])

  const fetchCandidates = useCallback(async () => {
    if (!supabaseUser) return
    setFetchingUsers(true)
    const uid = (supabaseUser as any)?.id
    try {
      const { data: liked } = await supabase
        .from('likes').select('to_user_id').eq('from_user_id', uid)
      const excludeIds = [uid, ...(liked?.map((l: {to_user_id: string}) => l.to_user_id) || [])]
      const { data: users } = await supabase
        .from('users').select('*')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .not('name', 'is', null)
        .limit(20)
      setCandidates(users || [])
      setCurrentIndex(0)
    } catch (err) { console.error(err) }
    finally { setFetchingUsers(false) }
  }, [supabaseUser])

  useEffect(() => {
    if (supabaseUser && (profile as {name?:string})?.name) fetchCandidates()
  }, [supabaseUser, profile, fetchCandidates])

  const handleLike = async (targetUser: UserProfile) => {
    if (!supabaseUser) return
    const uid = (supabaseUser as {id:string}).id
    try {
      await supabase.from('likes').insert({ from_user_id: uid, to_user_id: targetUser.id })
      const { data: mutual } = await supabase.from('likes').select('id')
        .eq('from_user_id', targetUser.id).eq('to_user_id', uid).maybeSingle()
      if (mutual) {
        await supabase.from('matches').insert({ user1_id: uid, user2_id: targetUser.id })
        setMatchMsg(`🔥 You matched with ${targetUser.name}!`)
        setTimeout(() => setMatchMsg(''), 3000)
      }
    } catch (err) { console.error(err) }
    setCurrentIndex((prev) => prev + 1)
  }

  const currentUser = candidates[currentIndex]
  const nextUser = candidates[currentIndex + 1]

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0b', color: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '56px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🔥</span>
          <span style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, #ff6b50, #ff4d33)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SayHi</span>
        </div>
      </div>

      {matchMsg && (
        <div style={{ margin: '0 16px', padding: '12px 16px', background: 'linear-gradient(135deg, #ff6b50, #ff4d33)', borderRadius: 12, textAlign: 'center', fontWeight: 700 }}>
          {matchMsg}
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', margin: '0 16px 16px', overflow: 'hidden' }}>
        {fetchingUsers ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ fontSize: 48 }}>🔥</div>
            <p style={{ color: '#666' }}>Finding people near you...</p>
          </div>
        ) : !currentUser ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 64 }}>😮‍💨</div>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>You've seen everyone!</h3>
            <button onClick={fetchCandidates} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #ff6b50, #ff4d33)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Refresh</button>
          </div>
        ) : (
          <div style={{ position: 'relative', height: '100%' }}>
            {nextUser && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', transform: 'scale(0.94) translateY(16px)', zIndex: 5, background: '#18181c' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
              </div>
            )}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', zIndex: 10, background: '#18181c' }}>
              {currentUser.photo_url ? (
                <Image src={currentUser.photo_url} alt={currentUser.name} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>👤</div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 80%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{currentUser.name}</h2>
                      {currentUser.age && <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>{currentUser.age}</span>}
                    </div>
                    {currentUser.bio && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>{currentUser.bio}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {currentUser && !fetchingUsers && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, paddingBottom: 96, padding: '0 16px 96px' }}>
          <button onClick={() => setCurrentIndex((prev) => prev + 1)} style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={28} color="rgba(255,255,255,0.6)" />
          </button>
          <button onClick={() => { handleLike(currentUser) }} style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid rgba(99,179,237,0.3)', background: 'rgba(99,179,237,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#90cdf4" fill="#90cdf4" />
          </button>
          <button onClick={() => handleLike(currentUser)} style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #ff6b50, #ff4d33)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(255,77,51,0.5)' }}>
            <Heart size={28} color="#fff" fill="#fff" />
          </button>
        </div>
      )}
      <BottomNav />
    </div>
  )
}
