'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { User } from '@/types'

interface AuthContextType {
  supabaseUser: SupabaseUser | null
  profile: User | null
  session: Session | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  supabaseUser: null,
  profile: null,
  session: null,
  loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    setProfile(data)
  }

  const refreshProfile = async () => {
    if (supabaseUser) await fetchProfile(supabaseUser.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ supabaseUser, profile, session, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
