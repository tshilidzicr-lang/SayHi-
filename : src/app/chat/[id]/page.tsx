'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ArrowLeft, Send } from 'lucide-react'

interface Message {
  id: string
  match_id: string
  sender_id: string
  text: string
  created_at: string
}

interface OtherUser {
  id: string
  name: string
  age: number | null
  photo_url: string | null
}

export default function ChatPage() {
  const params = useParams()
  const matchId = params.id as string
  const { supabaseUser, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !supabaseUser) router.replace('/auth')
  }, [supabaseUser, loading, router])

  useEffect(() => {
    if (!supabaseUser || !matchId) return
    const uid = (supabaseUser as {id: string}).id

    const fetchData = async () => {
      const { data: match } = await supabase
        .from('matches').select('*').eq('id', matchId).single()
      if (match) {
        const otherId = match.user1_id === uid ? match.user2_id : match.user1_id
        const { data: user } = await supabase
          .from('users').select('*').eq('id', otherId).single()
        setOtherUser(user)
      }
      const { data: msgs } = await supabase
        .from('messages').select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
      setMessages(msgs || [])
    }

    fetchData()

    const channel = supabase.channel(`chat:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'messages', filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        setMessages((prev) =>
          prev.find((m) => m.id === payload.new.id)
            ? prev : [...prev, payload.new as Message])
      }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabaseUser, matchId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !supabaseUser || sending) return
    setSending(true)
    const text = newMessage.trim()
    setNewMessage('')
    const uid = (supabaseUser as {id: string}).id
    try {
      await supabase.from('messages').insert({
        match_id: matchId, sender_id: uid, text,
      })
    } catch (err) {
      console.error(err)
      setNewMessage(text)
    } finally {
      setSending(false)
    }
  }

  const uid = supabaseUser ? (supabaseUser as {id: string}).id : ''

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0b', color: '#fff' }}>
      <div style={{ padding: '48px 16px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(17,17,19,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ArrowLeft />
        </button>
        {otherUser && (
          <span style={{ fontWeight: 600 }}>{otherUser.name}</span>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 40, color: '#666' }}>
            <p>Say hi to {otherUser?.name}! 🔥</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_id === uid ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
            <div style={{ maxWidth: '75%', padding: '10px 16px', borderRadius: 16, background: msg.sender_id === uid ? 'linear-gradient(135deg, #ff6b50, #ff4d33)' : 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 14 }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '12px 16px', paddingBottom: 90, display: 'flex', gap: 12, background: 'rgba(17,17,19,0.92)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Say something... 💬"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, background: '#18181c', border: '1px solid #3a3a46', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 15, outline: 'none' }}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          style={{ width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer', background: newMessage.trim() ? 'linear-gradient(135deg, #ff6b50, #ff4d33)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Send size={20} color="#fff" />
        </button>
      </div>
    </div>
  )
}
