'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User } from '@/types'

interface MatchModalProps {
  currentUser: User
  matchedUser: User
  matchId: string
  onClose: () => void
}

export default function MatchModal({ currentUser, matchedUser, matchId, onClose }: MatchModalProps) {
  const router = useRouter()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="match-burst relative z-10 flex flex-col items-center px-8 text-center">
        <div className="text-5xl mb-2">🔥</div>
        <h2 className="text-4xl font-black tracking-tight ember-text" style={{ fontFamily: "'Space Mono', monospace" }}>It's a Match!</h2>
        <p className="text-white/60 mt-2 text-sm">You and {matchedUser.name} liked each other</p>
        <div className="flex items-center gap-4 my-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4" style={{ borderColor: 'rgba(255,77,51,0.8)', boxShadow: '0 0 24px rgba(255,77,51,0.5)' }}>
            {currentUser.photo_url ? <Image src={currentUser.photo_url} alt={currentUser.name} width={128} height={128} className="object-cover w-full h-full" /> : <div className="w-full h-full bg-coal-600 flex items-center justify-center text-4xl">👤</div>}
          </div>
          <div className="text-3xl">💘</div>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4" style={{ borderColor: 'rgba(255,77,51,0.8)', boxShadow: '0 0 24px rgba(255,77,51,0.5)' }}>
            {matchedUser.photo_url ? <Image src={matchedUser.photo_url} alt={matchedUser.name} width={128} height={128} className="object-cover w-full h-full" /> : <div className="w-full h-full bg-coal-600 flex items-center justify-center text-4xl">👤</div>}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => { onClose(); router.push(`/chat/${matchId}`) }} className="btn-ember w-full py-4 rounded-2xl text-white font-bold text-base">Send a Message 💬</button>
          <button onClick={onClose} className="w-full py-4 rounded-2xl text-white/50 font-medium text-base">Keep Swiping</button>
        </div>
      </div>
    </div>
  )
}
