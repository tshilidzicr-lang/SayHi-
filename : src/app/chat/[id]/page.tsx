'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Message, User } from '@/types'
import { ArrowLeft, Send } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'

export default function ChatPage() {
  const { id: matchId } = useParams<{ id: string }>()
  const { supabaseUser, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!loading && !supabaseUser) router.replace('/auth') }, [supabaseUser, loading, router])

  useEffect(() => {
    if (!supabaseUser || !matchId) return
    const fetchMatch = async () => {
      const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single()
      if (!match) return
      const otherId = match.user1_id === supabaseUser.id ? match.user2_id : match.user1_id
      const { data: user } = await supabase.from('users').select('*').eq('id', otherId).single()
      setOtherUser(user)
    }
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true })
      setMessages(data || [])
    }
    fetchMatch()
    fetchMessages()
    const channel = supabase.channel(`chat:${matchId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, (payload) => {
      setMessages((prev) => prev.find((m) => m.id === payload.new.id) ? prev : [...prev, payload.new as Message])
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabaseUser, matchId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !supabaseUser || sending) return
    setSending(true)
    const text = newMessage.trim()
    setNewMessage('')
    try { await supabase.from('messages').insert({ match_id: matchId, sender_id: supabaseUser.id, text }) }
    catch (err) { console.error(err); setNewMessage(text) }
    finally { setSending(false); inputRef.current?.focus() }
  }

  return (
    <div className="h-screen flex flex-col bg-coal-900 overflow-hidden">
      <div className="flex-none flex items-center gap-3 px-4 pt-12 pb-4" style={{ background: 'rgba(17,17,19,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        {otherUser && (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: '2px solid rgba(255,77,51,0.5)' }}>
              {otherUser.photo_url ? <Image src={otherUser.photo_url} alt={otherUser.name} width={40} height={40} className="object-cover w-full h-full" /> : <div className="w-full h-full bg-coal-600 flex items-center justify-center text-lg">👤</div>}
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">{otherUser.name}</h2>
              {otherUser.age && <p className="text-coal-400 text-xs">{otherUser.age} years old</p>}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto scrollable px-4 py-4">
        {messages.length === 0 && <div className="flex flex-col items-center justify-center h-full text-center"><div className="text-4xl mb-3">👋</div><p className="text-coal-400 text-sm">You matched with {otherUser?.name}!<br/>Say hi 🔥</p></div>}
        {messages.map((msg) => {
          const isMine = msg.sender_id === supabaseUser?.id
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1.5`}>
              <div className="max-w-[75%]">
                <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed" style={isMine ? { background: 'linear-gradient(135deg, #ff6b50, #ff4d33)', color: '#fff', borderBottomRightRadius: '4px' } : { background: 'rgba(255,255,255,0.07)', color: '#fff', borderBottomLeftRadius: '4px' }}>{msg.text}</div>
                <span className="text-coal-400 text-[10px] mt-0.5 px-1 block">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex-none px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(17,17,19,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingBottom: 'calc(0.75rem + 80px)' }}>
        <input ref={inputRef} type="text" placeholder="Say something... 💬" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 input-dark py-3" />
        <button onClick={sendMessage} disabled={!newMessage.trim() || sending} className="w-11 h-11 rounded-xl flex items-center justify-center flex-none disabled:opacity-40" style={{ background: newMessage.trim() ? 'linear-gradient(135deg, #ff6b50, #ff4d33)' : 'rgba(255,255,255,0.05)' }}><Send className="w-5 h-5 text-white" /></button>
      </div>
    </div>
  )
}
