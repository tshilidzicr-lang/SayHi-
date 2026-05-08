'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async () => {
    if (!email || !password) return toast.error('Fill in all fields')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Account created!')
        router.push('/profile?setup=true')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back! 🔥')
        router.push('/')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnonymous = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      router.push('/profile?setup=true')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-coal-900 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,77,51,0.18) 0%, transparent 70%)' }} />
      <div className="flex-none pt-16 pb-8 flex flex-col items-center px-6 relative z-10">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4" style={{ background: 'linear-gradient(135deg, #ff6b50, #ff4d33)', boxShadow: '0 8px 32px rgba(255,77,51,0.5)' }}>🔥</div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Mono', monospace" }}><span className="ember-text">SayHi</span></h1>
        <p className="text-coal-400 mt-2 text-center text-sm">Swipe. Match. Connect.<br/>No strings, all vibes.</p>
      </div>
      <div className="flex-1 flex flex-col px-6 relative z-10 overflow-y-auto scrollable">
        <div className="flex bg-coal-700 rounded-xl p-1 mb-6">
          {(['signin', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${mode === m ? 'bg-coal-500 text-white' : 'text-coal-400'}`}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coal-400" />
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark pl-11" onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coal-400" />
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark pl-11 pr-11" onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-coal-400">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button onClick={handleAuth} disabled={loading} className="btn-ember w-full py-3.5 rounded-xl text-white font-semibold text-base mb-4 disabled:opacity-50">
          {loading ? '...' : mode === 'signin' ? 'Sign In 🔥' : 'Create Account'}
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-coal-500" />
          <span className="text-coal-400 text-xs">or</span>
          <div className="flex-1 h-px bg-coal-500" />
        </div>
        <button onClick={handleAnonymous} disabled={loading} className="w-full py-3.5 rounded-xl text-coal-400 font-medium text-sm border border-coal-500 hover:text-white transition-all duration-200">
          👻 Continue Anonymously
        </button>
      </div>
    </div>
  )
}
